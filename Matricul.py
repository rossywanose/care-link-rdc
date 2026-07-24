from users.models import OfficialAuthority, User
import os

# Supprime les anciennes autorités
OfficialAuthority.objects.all().delete()

# Crée les nouvelles (matricule uniquement)
matricules = [
    "MAT-2024-00001",
    "MAT-2024-00002",
    "MAT-2024-00003",
    "MAT-2024-00004",
    "MAT-2024-00005",
    "MAT-2024-00006",
    "MAT-2024-00007",
    "MAT-2024-00008",
    "MAT-2024-00009",
    "MAT-2024-00010",
]
for m in matricules:
    OfficialAuthority.objects.create(matricule=m)

# Supprime les anciens comptes autorité pour tester
User.objects.filter(role="authority").delete()

print("OK")
exit()
python manage.py loaddata faq_fixture.json
Ou utilisez le script Python qui est plus robuste :
bash
python manage.py shell < ai_assistant/seed_faq.py