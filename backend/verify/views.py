# =====================================================
# VUE PUBLIQUE DE VÉRIFICATION DE CERTIFICAT
# =====================================================

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from uuid import UUID

from births.models import BirthCertificate
from deaths.models import DeathCertificate


def find_certificate(identifier):
    """
    Cherche un certificat par certificate_id ou par UUID (pk).
    Retourne (certificate, cert_type) ou (None, None).
    """
    # Essayer par certificate_id d'abord
    try:
        cert = BirthCertificate.objects.get(certificate_id=identifier)
        return cert, "birth"
    except BirthCertificate.DoesNotExist:
        pass

    try:
        cert = DeathCertificate.objects.get(certificate_id=identifier)
        return cert, "death"
    except DeathCertificate.DoesNotExist:
        pass

    # Essayer par UUID (pk)
    try:
        uuid_obj = UUID(identifier)
        try:
            cert = BirthCertificate.objects.get(pk=uuid_obj)
            return cert, "birth"
        except BirthCertificate.DoesNotExist:
            try:
                cert = DeathCertificate.objects.get(pk=uuid_obj)
                return cert, "death"
            except DeathCertificate.DoesNotExist:
                pass
    except ValueError:
        pass  # Pas un UUID valide

    return None, None


@api_view(["GET"])
@permission_classes([AllowAny])
def verify_certificate(request, certificate_id):
    """
    Vérification publique d'un certificat.
    Accessible sans authentification.
    Accepte certificate_id (ex: DEC-2026-0002) ou UUID.
    """
    certificate, cert_type = find_certificate(certificate_id)

    if not certificate:
        return Response(
            {
                "valid": False,
                "message": "Certificat non trouvé.",
                "certificate_id": certificate_id,
            },
            status=status.HTTP_404_NOT_FOUND,
        )

    is_valid = certificate.status in ["approved", "paid"]

    response_data = {
        "valid": is_valid,
        "certificate_id": certificate.certificate_id,  # ← Toujours retourner le vrai certificate_id
        "type": cert_type,
        "status": certificate.status,
        "verified_at": (
            certificate.validation_date.isoformat()
            if certificate.validation_date
            else None
        ),
        "hospital_name": certificate.hospital.name if certificate.hospital else None,
    }

    if cert_type == "birth":
        response_data.update(
            {
                "child_name": f"{certificate.child_first_name} {certificate.child_last_name}",
                "date_of_birth": certificate.date_of_birth,
                "gender": certificate.gender,
                "place_of_birth": certificate.place_of_birth,
                "father_name": f"{certificate.father_first_name} {certificate.father_last_name}",
                "mother_name": f"{certificate.mother_first_name} {certificate.mother_last_name}",
            }
        )
    else:
        response_data.update(
            {
                "deceased_name": f"{certificate.first_name} {certificate.last_name}",
                "date_of_death": certificate.date_of_death,
                "date_of_birth": certificate.date_of_birth,
                "gender": certificate.gender,
                "place_of_death": certificate.place_of_death,
                "cause_of_death": certificate.cause_of_death,
            }
        )

    if not is_valid:
        response_data["message"] = (
            "Ce certificat n'est pas encore validé par les autorités compétentes."
        )
    else:
        response_data["message"] = "Certificat authentique et validé."

    return Response(response_data)
