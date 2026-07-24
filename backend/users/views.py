# ===============================================
# Views Users (CORRIGÉ — avec vérification matricule)
# ===============================================

from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.shortcuts import get_object_or_404
from .models import User, AuditLog, OfficialAuthority
from .serializers import (
    UserSerializer,
    UserCreateSerializer,
    AuthorityRegisterSerializer,
    UserUpdateSerializer,
    PasswordChangeSerializer,
    LoginSerializer,
    AuditLogSerializer,
)
from .permissions import IsOwnerOrAdmin, IsAuthorityOrAdmin

# =================================================
# NOUVEAU : Vérification matricule autorité
# =================================================


@api_view(["POST"])
@permission_classes([permissions.AllowAny])
def verify_authority_matricule(request):
    """
    Vérifier si un matricule d'autorité est valide avant inscription.
    Appelé par le frontend en temps réel (avant soumission du formulaire).
    """
    matricule = request.data.get("matricule", "").strip()

    if not matricule:
        return Response(
            {"detail": "Le matricule est requis.", "valid": False},
            status=status.HTTP_400_BAD_REQUEST,
        )

    result = OfficialAuthority.verify_matricule(matricule)

    if result["valid"]:
        return Response(result, status=status.HTTP_200_OK)
    else:
        return Response(result, status=status.HTTP_400_BAD_REQUEST)


class RegisterView(generics.CreateAPIView):
    """Register a new user (citizen or hospital)."""

    queryset = User.objects.all()
    serializer_class = UserCreateSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        # Generate tokens
        refresh = RefreshToken.for_user(user)

        return Response(
            {
                "user": UserSerializer(user).data,
                "tokens": {
                    "refresh": str(refresh),
                    "access": str(refresh.access_token),
                },
            },
            status=status.HTTP_201_CREATED,
        )


class AuthorityRegisterView(generics.CreateAPIView):
    """Register a new authority user (with matricule verification)."""

    queryset = User.objects.all()
    serializer_class = AuthorityRegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        # Generate tokens
        refresh = RefreshToken.for_user(user)

        return Response(
            {
                "user": UserSerializer(user).data,
                "tokens": {
                    "refresh": str(refresh),
                    "access": str(refresh.access_token),
                },
                "message": "Compte créé avec succès. En attente d'activation par un administrateur.",
            },
            status=status.HTTP_201_CREATED,
        )


class LoginView(generics.GenericAPIView):
    """Login and get JWT tokens."""

    serializer_class = LoginSerializer
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data["email"]
        password = serializer.validated_data["password"]

        user = authenticate(request, username=email, password=password)

        if user is None:
            # Log failed login attempt
            AuditLog.objects.create(
                action="login_failed",
                target_type="user",
                target_id=email,
                details={"email": email},
                ip_address=self.get_client_ip(request),
            )
            return Response(
                {"detail": "Email ou mot de passe incorrect."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        # ✅ Vérifier si le compte est actif (surtout pour les autorités)
        if not user.is_active:
            return Response(
                {
                    "detail": "Votre compte est en attente d'activation par un administrateur.",
                    "code": "ACCOUNT_INACTIVE",
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        # Update last login IP
        user.last_login_ip = self.get_client_ip(request)
        user.save()

        # Log successful login
        AuditLog.objects.create(
            user=user,
            action="login",
            target_type="user",
            target_id=str(user.id),
            details={"email": email},
            ip_address=self.get_client_ip(request),
        )

        refresh = RefreshToken.for_user(user)

        return Response(
            {
                "user": UserSerializer(user).data,
                "tokens": {
                    "refresh": str(refresh),
                    "access": str(refresh.access_token),
                },
            }
        )

    def get_client_ip(self, request):
        x_forwarded_for = request.META.get("HTTP_X_FORWARDED_FOR")
        if x_forwarded_for:
            return x_forwarded_for.split(",")[0].strip()
        return request.META.get("REMOTE_ADDR")


class LogoutView(generics.GenericAPIView):
    """Logout and blacklist refresh token."""

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data.get("refresh")
            token = RefreshToken(refresh_token)
            token.blacklist()

            # Log logout
            AuditLog.objects.create(
                user=request.user,
                action="logout",
                target_type="user",
                target_id=str(request.user.id),
            )

            return Response({"detail": "Déconnexion réussie."})
        except Exception:
            return Response(
                {"detail": "Token invalide."}, status=status.HTTP_400_BAD_REQUEST
            )


class UserProfileView(generics.RetrieveUpdateAPIView):
    """Get or update current user profile."""

    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user

    def get_serializer_class(self):
        if self.request.method in ["PUT", "PATCH"]:
            return UserUpdateSerializer
        return UserSerializer

    def retrieve(self, request, *args, **kwargs):
        user = self.get_object()
        serializer = UserSerializer(user)
        return Response(serializer.data)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop("partial", False)
        instance = self.get_object()

        # ✅ Nettoyer les données pour éviter les conflits
        data = request.data.copy()

        # Supprimer matricule vide pour éviter conflit d'unicité
        if "matricule" in data and not data["matricule"]:
            del data["matricule"]

        # Supprimer les champs protégés
        for field in ["matricule", "role", "is_staff", "is_superuser", "email"]:
            data.pop(field, None)

        serializer = UserUpdateSerializer(instance, data=data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        return Response(UserSerializer(instance).data)


class UserListView(generics.ListAPIView):
    """List all users (authority/admin only)."""

    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthorityOrAdmin]

    def get_queryset(self):
        queryset = User.objects.all()
        role = self.request.query_params.get("role")
        if role:
            queryset = queryset.filter(role=role)
        return queryset.select_related("hospital")


class UserDetailView(generics.RetrieveAPIView):
    """Get user details."""

    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsOwnerOrAdmin]
    lookup_field = "pk"


class PasswordChangeView(generics.GenericAPIView):
    """Change user password."""

    serializer_class = PasswordChangeSerializer
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = request.user

        if not user.check_password(serializer.validated_data["current_password"]):
            return Response(
                {"current_password": "Mot de passe actuel incorrect."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user.set_password(serializer.validated_data["new_password"])
        user.save()

        # Log password change
        AuditLog.objects.create(
            user=user,
            action="update",
            target_type="user",
            target_id=str(user.id),
            details={"field": "password"},
        )

        return Response({"detail": "Mot de passe changé avec succès."})


class AuditLogListView(generics.ListAPIView):
    """List audit logs (authority/admin only)."""

    queryset = AuditLog.objects.all()
    serializer_class = AuditLogSerializer
    permission_classes = [IsAuthorityOrAdmin]

    def get_queryset(self):
        queryset = AuditLog.objects.all()

        # Filters
        action = self.request.query_params.get("action")
        user_id = self.request.query_params.get("user")
        target_type = self.request.query_params.get("target_type")
        date_from = self.request.query_params.get("date_from")
        date_to = self.request.query_params.get("date_to")

        if action:
            queryset = queryset.filter(action=action)
        if user_id:
            queryset = queryset.filter(user_id=user_id)
        if target_type:
            queryset = queryset.filter(target_type=target_type)
        if date_from:
            queryset = queryset.filter(timestamp__gte=date_from)
        if date_to:
            queryset = queryset.filter(timestamp__lte=date_to)

        return queryset.select_related("user")
