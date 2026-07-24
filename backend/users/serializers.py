# ==========================================
# SERIALIZERS USERS (CORRIGÉ — AuthorityRegisterSerializer fixé)
# ==========================================

from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from .models import User, AuditLog, OfficialAuthority


class UserSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(source="get_full_name", read_only=True)
    role_display = serializers.CharField(source="get_role_display", read_only=True)
    hospital_name = serializers.CharField(source="hospital.name", read_only=True)
    hospital_license = serializers.CharField(
        source="hospital.official_license", read_only=True
    )
    hospital_status = serializers.CharField(source="hospital.status", read_only=True)

    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "username",
            "first_name",
            "last_name",
            "full_name",
            "role",
            "role_display",
            "phone",
            "avatar",
            "date_of_birth",
            "gender",
            "marital_status",
            "nationality",
            "province",
            "commune",
            "address",
            "birth_place",
            "city",
            "id_number",
            "matricule",
            "grade",
            "service",
            "direction",
            "hospital",
            "hospital_name",
            "hospital_license",
            "hospital_status",
            "language",
            "theme",
            "notifications_enabled",
            "created_at",
            "updated_at",
            "last_login",
        ]
        read_only_fields = ["id", "created_at", "updated_at", "last_login"]


class UserCreateSerializer(serializers.ModelSerializer):
    """Serializer pour inscription citoyen/hôpital."""

    password = serializers.CharField(
        write_only=True, required=True, validators=[validate_password]
    )
    password_confirm = serializers.CharField(write_only=True, required=True)

    # Champs hôpital (optionnels, envoyés seulement si role='hospital')
    hospital_name = serializers.CharField(
        write_only=True, required=False, allow_blank=True
    )
    hospital_license = serializers.CharField(
        write_only=True, required=False, allow_blank=True
    )
    hospital_city = serializers.CharField(
        write_only=True, required=False, allow_blank=True
    )
    hospital_commune = serializers.CharField(
        write_only=True, required=False, allow_blank=True
    )
    hospital_address = serializers.CharField(
        write_only=True, required=False, allow_blank=True
    )

    class Meta:
        model = User
        fields = [
            "email",
            "username",
            "first_name",
            "last_name",
            "password",
            "password_confirm",
            "role",
            "phone",
            "date_of_birth",
            "gender",
            "marital_status",
            "province",
            "commune",
            "address",
            "city",
            # Champs hôpital
            "hospital_name",
            "hospital_license",
            "hospital_city",
            "hospital_commune",
            "hospital_address",
        ]

    def validate(self, attrs):
        if attrs["password"] != attrs.pop("password_confirm"):
            raise serializers.ValidationError(
                {"password": "Les mots de passe ne correspondent pas."}
            )

        # Validation hôpital
        role = attrs.get("role", "citizen")
        if role == "hospital":
            if not attrs.get("hospital_name"):
                raise serializers.ValidationError(
                    {
                        "hospital_name": "Le nom de l'hôpital est requis pour un compte hôpital."
                    }
                )

        return attrs

    def create(self, validated_data):
        # Extraire les données hôpital
        hospital_name = validated_data.pop("hospital_name", "")
        hospital_license = validated_data.pop("hospital_license", "")
        hospital_city = validated_data.pop("hospital_city", "")
        hospital_commune = validated_data.pop("hospital_commune", "")
        hospital_address = validated_data.pop("hospital_address", "")

        role = validated_data.get("role", "citizen")

        # Créer l'utilisateur
        user = User.objects.create_user(**validated_data)

        # Créer l'hôpital automatiquement si role = hospital
        if role == "hospital" and hospital_name:
            try:
                from hospitals.models import Hospital
                import datetime

                year = datetime.datetime.now().year
                count = Hospital.objects.filter(created_at__year=year).count() + 1
                hospital_id = f"H{year}-{count:04d}"

                hospital = Hospital.objects.create(
                    hospital_id=hospital_id,
                    name=hospital_name,
                    license_number=hospital_license or "",
                    city=hospital_city or validated_data.get("city", ""),
                    commune=hospital_commune or validated_data.get("commune", ""),
                    address=hospital_address or validated_data.get("address", ""),
                    province=validated_data.get("province", ""),
                    phone=validated_data.get("phone", ""),
                    email=validated_data.get("email", ""),
                    status="pending",
                    opening_fee_paid=False,
                    director_name=f"{validated_data.get('first_name', '')} {validated_data.get('last_name', '')}".strip(),
                )

                # Associer l'hôpital à l'utilisateur
                user.hospital = hospital
                user.save()

            except Exception as e:
                # Si la création de l'hôpital échoue, on supprime l'utilisateur
                user.delete()
                raise serializers.ValidationError(
                    {"hospital": f"Erreur lors de la création de l'hôpital: {str(e)}"}
                )

        return user


# =================================================
# NOUVEAU : Serializer inscription autorité (CORRIGÉ)
# =================================================


class AuthorityRegisterSerializer(serializers.ModelSerializer):
    """Inscription autorité — matricule obligatoire, infos saisies par l'utilisateur."""

    password = serializers.CharField(
        write_only=True, required=True, validators=[validate_password]
    )
    password_confirm = serializers.CharField(write_only=True, required=True)
    matricule = serializers.CharField(required=True, write_only=True)

    class Meta:
        model = User
        fields = [
            "email",
            "username",
            "first_name",
            "last_name",
            "password",
            "password_confirm",
            "matricule",
            "phone",
            "province",
            "city",
            "commune",
            "address",
            "grade",
            "service",
        ]

    def validate_matricule(self, value):
        value = value.strip().upper()
        result = OfficialAuthority.verify_matricule(value)
        if not result["valid"]:
            raise serializers.ValidationError(result["reason"])
        return value

    def validate(self, attrs):
        if attrs["password"] != attrs.pop("password_confirm"):
            raise serializers.ValidationError(
                {"password_confirm": "Les mots de passe ne correspondent pas."}
            )
        return attrs

    def create(self, validated_data):
        matricule = validated_data.pop("matricule")
        password = validated_data.pop("password")

        user = User.objects.create_user(
            **validated_data,
            role="authority",
            matricule=matricule,
            is_active=True,
        )
        user.set_password(password)
        user.save()

        # Marquer le matricule comme utilisé
        authority = OfficialAuthority.objects.get(matricule=matricule)
        authority.used_for_registration = True
        authority.save()

        return user


class UserUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "first_name",
            "last_name",
            "phone",
            "avatar",
            "date_of_birth",
            "gender",
            "marital_status",
            "province",
            "commune",
            "address",
            "birth_place",
            "city",
            "id_number",
            "grade",
            "service",
            "direction",
            "language",
            "theme",
            "notifications_enabled",
        ]


class PasswordChangeSerializer(serializers.Serializer):
    current_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, validators=[validate_password])
    new_password_confirm = serializers.CharField(required=True)

    def validate(self, attrs):
        if attrs["new_password"] != attrs["new_password_confirm"]:
            raise serializers.ValidationError(
                {"new_password": "Les mots de passe ne correspondent pas."}
            )
        return attrs


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)
    password = serializers.CharField(required=True, write_only=True)


class AuditLogSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source="user.full_name", read_only=True)
    action_display = serializers.CharField(source="get_action_display", read_only=True)

    class Meta:
        model = AuditLog
        fields = [
            "id",
            "user",
            "user_name",
            "action",
            "action_display",
            "target_type",
            "target_id",
            "details",
            "ip_address",
            "timestamp",
        ]
