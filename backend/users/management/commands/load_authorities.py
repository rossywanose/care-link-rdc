# users/management/commands/load_authorities.py
# ============================================================
# Commande Django : Charger les autorités officielles
# ============================================================

import os
from django.core.management.base import BaseCommand
from users.models import OfficialAuthority


class Command(BaseCommand):
    help = """Charge la liste officielle des autorités depuis un fichier Excel ou CSV.

    Usage:
        python manage.py load_authorities --excel data/official_authorities.xlsx
        python manage.py load_authorities --csv data/official_authorities.csv
        python manage.py load_authorities --excel data/official_authorities.xlsx --dry-run
    """

    def add_arguments(self, parser):
        parser.add_argument(
            "--excel", type=str, help="Chemin vers le fichier Excel (.xlsx)"
        )
        parser.add_argument("--csv", type=str, help="Chemin vers le fichier CSV")
        parser.add_argument(
            "--dry-run",
            action="store_true",
            help="Simuler sans modifier la base de données",
        )

    def handle(self, *args, **options):
        dry_run = options["dry_run"]

        if options["excel"]:
            filepath = options["excel"]
            self.stdout.write(
                self.style.NOTICE(f"📖 Lecture du fichier Excel: {filepath}")
            )

            try:
                result = OfficialAuthority.load_from_excel(filepath)
            except ImportError as e:
                self.stdout.write(self.style.ERROR(f"❌ {str(e)}"))
                self.stdout.write(
                    self.style.WARNING("💡 Installez openpyxl: pip install openpyxl")
                )
                return
            except Exception as e:
                self.stdout.write(self.style.ERROR(f"❌ Erreur: {str(e)}"))
                return

        elif options["csv"]:
            filepath = options["csv"]
            self.stdout.write(
                self.style.NOTICE(f"📖 Lecture du fichier CSV: {filepath}")
            )

            try:
                result = OfficialAuthority.load_from_csv(filepath)
            except Exception as e:
                self.stdout.write(self.style.ERROR(f"❌ Erreur: {str(e)}"))
                return
        else:
            self.stdout.write(
                self.style.ERROR("❌ Veuillez spécifier --excel ou --csv")
            )
            self.stdout.write(
                self.style.WARNING(
                    "💡 Exemple: python manage.py load_authorities --excel data/official_authorities.xlsx"
                )
            )
            return

        # Afficher les résultats
        self.stdout.write("")
        self.stdout.write(self.style.SUCCESS("✅ Chargement terminé !"))
        self.stdout.write(f"   📊 Créés: {result['created']}")
        self.stdout.write(f"   🔄 Mis à jour: {result['updated']}")

        if result["errors"]:
            self.stdout.write(
                self.style.WARNING(f"   ⚠️  Erreurs: {len(result['errors'])}")
            )
            for error in result["errors"][:5]:  # Afficher max 5 erreurs
                self.stdout.write(self.style.ERROR(f"      - {error}"))
            if len(result["errors"]) > 5:
                self.stdout.write(
                    self.style.ERROR(
                        f"      ... et {len(result['errors']) - 5} autres erreurs"
                    )
                )
        else:
            self.stdout.write(self.style.SUCCESS("   ✨ Aucune erreur !"))

        # Statistiques finales
        total = OfficialAuthority.objects.count()
        active = OfficialAuthority.objects.filter(is_active=True).count()
        used = OfficialAuthority.objects.filter(used_for_registration=True).count()

        self.stdout.write("")
        self.stdout.write(self.style.NOTICE("📈 Statistiques de la base:"))
        self.stdout.write(f"   Total: {total}")
        self.stdout.write(f"   Actifs: {active}")
        self.stdout.write(f"   Utilisés: {used}")
        self.stdout.write(f"   Disponibles: {active - used}")
