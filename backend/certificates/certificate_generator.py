# =====================================================
# certificates/certificate_generator.py
# Generateur de certificats PDF officiel RDC - Care-Link
# =====================================================

import os
import qrcode
from io import BytesIO
from datetime import datetime
from django.conf import settings
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib.colors import HexColor, black, white
from reportlab.pdfgen import canvas
from reportlab.lib.utils import ImageReader
from reportlab.platypus import Paragraph
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_JUSTIFY

# =====================================================
# COULEURS OFFICIELLES RDC
# =====================================================
RDC_BLUE = HexColor("#0072CE")
RDC_RED = HexColor("#CE1126")
GOLD = HexColor("#C9A227")
BG_CREAM = HexColor("#FDFBF7")
TEXT_DARK = HexColor("#1A1A1A")
TEXT_GRAY = HexColor("#555555")
LIGHT_GRAY = HexColor("#E8E4DC")

# =====================================================
# CHEMIN VERS L'IMAGE DES ARMOIRIES
# =====================================================
ARMOIRIES_PATH = os.path.join(settings.BASE_DIR, "static", "images", "armoiries.png")

# =====================================================
# FONCTIONS UTILITAIRES
# =====================================================


def _format_date_fr(date_obj):
    """Formate une date en francais."""
    if not date_obj:
        return "[DATE NON SPÉCIFIÉE]"
    mois_fr = {
        1: "Janvier",
        2: "Février",
        3: "Mars",
        4: "Avril",
        5: "Mai",
        6: "Juin",
        7: "Juillet",
        8: "Août",
        9: "Septembre",
        10: "Octobre",
        11: "Novembre",
        12: "Décembre",
    }
    return f"le {date_obj.day} {mois_fr.get(date_obj.month, '')} {date_obj.year}"


def _format_date_fr_full(date_obj):
    """Formate une date en francais avec jour en lettres."""
    if not date_obj:
        return "[DATE NON SPÉCIFIÉE]"
    jours_fr = {
        1: "Premier",
        2: "Deuxième",
        3: "Troisième",
        4: "Quatrième",
        5: "Cinquième",
        6: "Sixième",
        7: "Septième",
        8: "Huitième",
        9: "Neuvième",
        10: "Dixième",
        11: "Onzième",
        12: "Douzième",
        13: "Treizième",
        14: "Quatorzième",
        15: "Quinzième",
        16: "Seizième",
        17: "Dix-Septième",
        18: "Dix-Huitième",
        19: "Dix-Neuvième",
        20: "Vingtième",
        21: "Vingt et Unième",
        22: "Vingt-Deuxième",
        23: "Vingt-Troisième",
        24: "Vingt-Quatrième",
        25: "Vingt-Cinquième",
        26: "Vingt-Sixième",
        27: "Vingt-Septième",
        28: "Vingt-Huitième",
        29: "Vingt-Neuvième",
        30: "Trentième",
        31: "Trente et Unième",
    }
    mois_fr = {
        1: "Janvier",
        2: "Février",
        3: "Mars",
        4: "Avril",
        5: "Mai",
        6: "Juin",
        7: "Juillet",
        8: "Août",
        9: "Septembre",
        10: "Octobre",
        11: "Novembre",
        12: "Décembre",
    }
    jour_text = jours_fr.get(date_obj.day, str(date_obj.day))
    # Minuscule sauf "Premier" qui reste avec majuscule
    if date_obj.day != 1:
        jour_text = jour_text.lower()
    return f"le {jour_text} jour du mois de {mois_fr.get(date_obj.month, '')} de l'an {date_obj.year}"


def _safe_attr(obj, attr, default="Non spécifié"):
    """Recupere un attribut en toute securite."""
    try:
        val = getattr(obj, attr, default)
        return val if val is not None and val != "" else default
    except:
        return default


def _safe_hospital_name(cert):
    """Recupere le nom de l'hopital."""
    try:
        if cert.hospital and hasattr(cert.hospital, "name"):
            return cert.hospital.name
        return "Non spécifié"
    except:
        return "Non spécifié"


def _safe_hospital_city(cert):
    """Recupere la ville de l'hopital."""
    try:
        if cert.hospital and hasattr(cert.hospital, "city"):
            return cert.hospital.city
        return "Kinshasa"
    except:
        return "Kinshasa"


def _safe_hospital_commune(cert):
    """Recupere la commune de l'hopital."""
    try:
        if cert.hospital and hasattr(cert.hospital, "commune"):
            return cert.hospital.commune
        return "KIMBANSEKE"
    except:
        return "KIMBANSEKE"


# =====================================================
# STYLES DE PARAGRAPHE PREDEFINIS
# =====================================================


def _get_attest_style():
    """Style pour le texte d'attestation - aligne gauche avec espacement."""
    return ParagraphStyle(
        "Attestation",
        fontName="Helvetica",
        fontSize=10.5,
        leading=16,
        alignment=TA_LEFT,
        spaceAfter=12,
        leftIndent=0,
        rightIndent=0,
    )


def _get_bold_style():
    """Style pour texte en gras."""
    return ParagraphStyle(
        "BoldText",
        fontName="Helvetica-Bold",
        fontSize=10.5,
        leading=16,
        alignment=TA_LEFT,
        spaceAfter=8,
    )


# =====================================================
# ELEMENTS GRAPHIQUES
# =====================================================


def _draw_subtle_watermark(c, width, height):
    """Filigrane tres leger en arriere-plan."""
    c.saveState()
    c.setFillColor(HexColor("#F0EDE5"))
    c.setFont("Helvetica", 8)

    for i in range(3):
        y_pos = height * 0.3 + (i * height * 0.25)
        c.saveState()
        c.translate(width / 2, y_pos)
        c.rotate(45)
        c.drawCentredString(0, 0, "RDC - CARE-LINK")
        c.restoreState()

    c.restoreState()


def _draw_elegant_borders(c, width, height):
    """Bordures elegantes avec coins ornes."""
    margin = 15 * mm

    # Bordure exterieure epaisse
    c.setStrokeColor(GOLD)
    c.setLineWidth(1.5)
    c.rect(margin, margin, width - 2 * margin, height - 2 * margin, fill=0, stroke=1)

    # Bordure interieure fine
    inner = margin + 3 * mm
    c.setStrokeColor(RDC_BLUE)
    c.setLineWidth(0.5)
    c.rect(inner, inner, width - 2 * inner, height - 2 * inner, fill=0, stroke=1)

    # Coins ornes
    corner_size = 10 * mm
    c.setStrokeColor(GOLD)
    c.setLineWidth(2)

    c.arc(
        margin,
        height - margin - corner_size,
        margin + corner_size,
        height - margin,
        90,
        90,
    )
    c.arc(
        width - margin - corner_size,
        height - margin - corner_size,
        width - margin,
        height - margin,
        0,
        90,
    )
    c.arc(margin, margin, margin + corner_size, margin + corner_size, 180, 90)
    c.arc(
        width - margin - corner_size,
        margin,
        width - margin,
        margin + corner_size,
        270,
        90,
    )


def _draw_header_v2(c, width, height, cert, cert_type="birth"):
    """En-tete revu avec armoiries bien positionnees et QR code aligne."""

    # === ZONE DE L'EN-TETE ===
    header_top = height - 18 * mm

    # === ARMOIRIES (gauche) ===
    arm_left = 18 * mm
    arm_top = header_top - 2 * mm
    arm_size = 28 * mm

    if os.path.exists(ARMOIRIES_PATH):
        try:
            c.drawImage(
                ARMOIRIES_PATH,
                arm_left,
                arm_top - arm_size,
                width=arm_size,
                height=arm_size,
                preserveAspectRatio=True,
                mask="auto",
            )
        except:
            pass

    # === TEXTE CENTRE ===
    c.setFillColor(TEXT_DARK)
    center_x = width / 2
    text_start_y = header_top - 2 * mm

    c.setFont("Helvetica-Bold", 11)
    c.drawCentredString(center_x, text_start_y, "RÉPUBLIQUE DÉMOCRATIQUE DU CONGO")

    c.setFont("Helvetica-Bold", 9.5)
    c.drawCentredString(
        center_x, text_start_y - 5 * mm, "MINISTÈRE DE LA SANTÉ PUBLIQUE"
    )

    c.setFont("Helvetica", 8.5)
    c.drawCentredString(
        center_x, text_start_y - 9.5 * mm, "DIRECTION GÉNÉRALE DE L'ÉTAT CIVIL"
    )

    # Ligne decorative
    c.setStrokeColor(GOLD)
    c.setLineWidth(0.8)
    line_y = text_start_y - 12.5 * mm
    c.line(center_x - 55 * mm, line_y, center_x + 55 * mm, line_y)

    # === QR CODE (droite) ===
    base_url = "https://carelink-rdc.cd/verify"
    cert_id = _safe_attr(cert, "certificate_id", "UNKNOWN")

    qr_data = (
        f"{base_url}/{cert_id}\n"
        f"Type: {'Naissance' if cert_type == 'birth' else 'Décès'}\n"
        f"ID: {cert_id}\n"
        f"Valide: {cert.validation_date.strftime('%d/%m/%Y') if hasattr(cert, 'validation_date') and cert.validation_date else 'En attente'}"
    )

    qr = qrcode.QRCode(version=3, box_size=3, border=1)
    qr.add_data(qr_data)
    qr.make(fit=True)
    qr_img = qr.make_image(fill_color="black", back_color="white")
    qr_buf = BytesIO()
    qr_img.save(qr_buf, format="PNG")
    qr_buf.seek(0)

    qr_reader = ImageReader(qr_buf)
    qr_size = 20 * mm
    qr_x = width - 42 * mm
    qr_y = header_top - 4 * mm - qr_size

    c.drawImage(qr_reader, qr_x, qr_y, width=qr_size, height=qr_size)

    # Texte sous QR - bien aligne a droite
    c.setFillColor(TEXT_DARK)
    c.setFont("Helvetica-Bold", 7)
    text_qr_x = qr_x + qr_size / 2
    c.drawCentredString(text_qr_x, qr_y - 4 * mm, f"P.No {cert_id}")
    c.drawCentredString(text_qr_x, qr_y - 7.5 * mm, f"H.No {cert_id}")


def _draw_footer_v2(c, width, height, cert_id):
    """Pied de page revu."""
    # Ligne de separation
    c.setStrokeColor(GOLD)
    c.setLineWidth(0.8)
    c.line(20 * mm, 32 * mm, width - 20 * mm, 32 * mm)

    # Numero en bas a droite
    c.setFillColor(TEXT_DARK)
    c.setFont("Helvetica-Bold", 11)
    c.drawRightString(width - 20 * mm, 25 * mm, cert_id)

    # Texte de verification
    c.setFont("Helvetica", 7)
    c.setFillColor(TEXT_GRAY)
    c.drawCentredString(
        width / 2,
        18 * mm,
        "Ce document est protégé par un QR Code d'authenticité. Vérifiez sur carelink-rdc.cd",
    )
    c.drawCentredString(
        width / 2,
        13 * mm,
        "RÉPUBLIQUE DÉMOCRATIQUE DU CONGO — Direction Générale de l'État Civil",
    )


def _draw_signature_block_v2(c, width, commune, doctor_name):
    """Bloc de signature revu avec plus d'espace."""
    margin = 25 * mm

    # "Fait a..."
    y = 75 * mm
    c.setFont("Helvetica", 10)
    c.setFillColor(TEXT_DARK)
    today = datetime.now()
    c.drawRightString(
        width - margin,
        y,
        f"Fait à {commune}, le {today.day}/{today.month}/{today.year}",
    )

    # "L'Officier de l'État Civil"
    y -= 14 * mm
    c.setFont("Helvetica-Bold", 10)
    c.drawRightString(width - margin, y, "L'Officier de l'État Civil")

    # Nom du medecin
    y -= 8 * mm
    c.setFont("Helvetica-Oblique", 9)
    c.drawRightString(width - margin, y, doctor_name or "[SIGNATURE]")

    # Ligne de signature
    y -= 4 * mm
    c.setStrokeColor(TEXT_DARK)
    c.setLineWidth(0.5)
    sig_width = 45 * mm
    c.line(width - margin - sig_width, y, width - margin, y)


# =====================================================
# CERTIFICAT DE NAISSANCE
# =====================================================


def generate_birth_certificate(birth_certificate, output_path=None):
    """Genere un certificat de naissance PDF professionnel."""
    buffer = BytesIO()
    c = canvas.Canvas(buffer, pagesize=A4)
    width, height = A4

    # 1. Fond creme
    c.setFillColor(BG_CREAM)
    c.rect(0, 0, width, height, fill=1, stroke=0)

    # 2. Filigrane
    _draw_subtle_watermark(c, width, height)

    # 3. Bordures
    _draw_elegant_borders(c, width, height)

    # 4. En-tete
    _draw_header_v2(c, width, height, birth_certificate, cert_type="birth")

    margin = 30 * mm
    city = _safe_hospital_city(birth_certificate)
    commune = _safe_hospital_commune(birth_certificate)

    # === INFORMATIONS ADMINISTRATIVES ===
    y = height - 70 * mm

    c.setFillColor(TEXT_DARK)
    c.setFont("Helvetica-Bold", 9)
    c.drawString(margin, y, f"Ville de {city}")
    c.drawString(margin, y - 4.5 * mm, f"Commune de {commune}")
    c.drawString(margin, y - 9 * mm, "Service de l'État-Civil")

    # === TITRE ===
    y = height - 92 * mm
    c.setFillColor(RDC_BLUE)
    c.setFont("Helvetica-Bold", 20)
    c.drawCentredString(width / 2, y, "ATTESTATION DE NAISSANCE")

    # Ligne sous le titre
    c.setStrokeColor(GOLD)
    c.setLineWidth(1.5)
    c.line(width / 2 - 65 * mm, y - 4 * mm, width / 2 + 65 * mm, y - 4 * mm)

    # === TEXTE D'ATTESTATION ===
    y = height - 110 * mm

    # Genre
    if birth_certificate.gender == "F":
        gender_label = "Fille"
        gender_pronoun = "nee"
        gender_article = "Mademoiselle"
    else:
        gender_label = "Fils"
        gender_pronoun = "né"
        gender_article = "Monsieur"

    date_naissance = _format_date_fr_full(birth_certificate.date_of_birth)
    date_naissance_courte = _format_date_fr(birth_certificate.date_of_birth)

    child_name = f"{_safe_attr(birth_certificate, 'child_first_name')} {_safe_attr(birth_certificate, 'child_last_name')}"
    father_name = (
        birth_certificate.father_full_name
        or f"{_safe_attr(birth_certificate, 'father_first_name')} {_safe_attr(birth_certificate, 'father_last_name')}"
    )
    mother_name = (
        birth_certificate.mother_full_name
        or f"{_safe_attr(birth_certificate, 'mother_first_name')} {_safe_attr(birth_certificate, 'mother_last_name')}"
    )

    # Adresse
    adresse = _safe_attr(birth_certificate, "address", "")
    quartier = _safe_attr(birth_certificate, "quartier", "")
    if adresse and quartier:
        residence = f"residant sur l'avenue {adresse} dans le quartier {quartier}"
    elif adresse:
        residence = f"residant sur l'avenue {adresse}"
    elif quartier:
        residence = f"residant dans le quartier {quartier}"
    else:
        residence = "residant"

    # Style
    attest_style = _get_attest_style()
    text_width = width - 2 * margin - 10 * mm

    # === PARAGRAPHE 1 : Introduction ===
    doctor_name = _safe_attr(birth_certificate, "doctor_name", "[NOM DU MÉDECIN]")
    para1_text = (
        f"Je soussigne, <b>{doctor_name}</b>, "
        f"Officier de l'Etat Civil de la Commune de <b>{commune}</b>, atteste par la presente "
        f"qu'il ressort des documents en ma possession que :"
    )
    p1 = Paragraph(para1_text, attest_style)
    p1.wrapOn(c, text_width, 100 * mm)
    p1.drawOn(c, margin, y - p1.height)
    y -= p1.height + 8 * mm

    # === PARAGRAPHE 2 : Identite de l'enfant ===
    para2_text = (
        f"<b>{gender_article} {child_name}</b>, {gender_label} de <b>{father_name}</b> et de "
        f"<b>{mother_name}</b>."
    )
    p2 = Paragraph(para2_text, attest_style)
    p2.wrapOn(c, text_width, 100 * mm)
    p2.drawOn(c, margin, y - p2.height)
    y -= p2.height + 8 * mm

    # === PARAGRAPHE 3 : Details de naissance ===
    place_birth = _safe_attr(birth_certificate, "place_of_birth", "[LIEU]")
    para3_text = (
        f"{gender_pronoun.capitalize()}(e) à <b>{place_birth}</b>, {date_naissance_courte}, "
        f"{residence} dans la commune de <b>{commune}</b>, "
        f"de Nationalite Congolaise, est effectivement {gender_pronoun}(e) a "
        f"<b>{place_birth}</b>, {date_naissance}."
    )
    p3 = Paragraph(para3_text, attest_style)
    p3.wrapOn(c, text_width, 100 * mm)
    p3.drawOn(c, margin, y - p3.height)
    y -= p3.height + 12 * mm

    # === INFORMATIONS COMPLEMENTAIRES ===
    c.setFont("Helvetica-Bold", 10)
    c.setFillColor(RDC_BLUE)
    c.drawString(margin, y, "INFORMATIONS COMPLÉMENTAIRES :")
    y -= 7 * mm

    c.setFont("Helvetica", 9)
    c.setFillColor(TEXT_DARK)
    weight = (
        f"{birth_certificate.weight} kg" if birth_certificate.weight else "Non spécifié"
    )
    time_birth = _safe_attr(birth_certificate, "time_of_birth", "Non spécifiée")
    hospital_name = _safe_hospital_name(birth_certificate)
    decl_date = (
        birth_certificate.declaration_date.strftime("%d/%m/%Y")
        if birth_certificate.declaration_date
        else "Non spécifiée"
    )

    infos = [
        f"N° d'Acte de Naissance : {birth_certificate.certificate_id}",
        f"Poids à la naissance : {weight}",
        f"Heure de naissance : {time_birth}",
        f"Nom du Médecin : {doctor_name}",
        f"N° Licence médicale : {_safe_attr(birth_certificate, 'doctor_license', 'Non spécifiée')}",
        f"Hôpital : {hospital_name}",
        f"Date de déclaration : {decl_date}",
        f"Statut : {birth_certificate.get_status_display()}",
    ]

    for info in infos:
        c.drawString(margin + 5 * mm, y, f"\u2022 {info}")
        y -= 5.5 * mm

    # === SIGNATURE ===
    _draw_signature_block_v2(c, width, commune, doctor_name)

    # === PIED DE PAGE ===
    _draw_footer_v2(c, width, height, birth_certificate.certificate_id)

    c.showPage()
    c.save()
    buffer.seek(0)

    if output_path:
        with open(output_path, "wb") as f:
            f.write(buffer.getvalue())

    return buffer


# =====================================================
# CERTIFICAT DE DECES
# =====================================================


def generate_death_certificate(death_certificate, output_path=None):
    """Genere un certificat de deces PDF professionnel."""
    buffer = BytesIO()
    c = canvas.Canvas(buffer, pagesize=A4)
    width, height = A4

    # 1. Fond creme
    c.setFillColor(BG_CREAM)
    c.rect(0, 0, width, height, fill=1, stroke=0)

    # 2. Filigrane
    _draw_subtle_watermark(c, width, height)

    # 3. Bordures
    _draw_elegant_borders(c, width, height)

    # 4. En-tete
    _draw_header_v2(c, width, height, death_certificate, cert_type="death")

    margin = 30 * mm
    city = _safe_hospital_city(death_certificate)
    commune = _safe_hospital_commune(death_certificate)

    # === INFORMATIONS ADMINISTRATIVES ===
    y = height - 70 * mm

    c.setFillColor(TEXT_DARK)
    c.setFont("Helvetica-Bold", 9)
    c.drawString(margin, y, f"Ville de {city}")
    c.drawString(margin, y - 4.5 * mm, f"Commune de {commune}")
    c.drawString(margin, y - 9 * mm, "Service de l'État-Civil")

    # === TITRE ===
    y = height - 92 * mm
    c.setFillColor(RDC_RED)
    c.setFont("Helvetica-Bold", 20)
    c.drawCentredString(width / 2, y, "ATTESTATION DE DÉCÈS")

    # Ligne sous le titre
    c.setStrokeColor(GOLD)
    c.setLineWidth(1.5)
    c.line(width / 2 - 60 * mm, y - 4 * mm, width / 2 + 60 * mm, y - 4 * mm)

    # === TEXTE D'ATTESTATION ===
    y = height - 110 * mm

    gender_label = "Femme" if death_certificate.gender == "F" else "Homme"

    if death_certificate.gender == "F":
        decede_forme = "décédée"
        est_forme = "est effectivement décédée"
    else:
        decede_forme = "décédé"
        est_forme = "est effectivement décédé"

    date_deces = _format_date_fr_full(death_certificate.date_of_death)
    date_deces_courte = _format_date_fr(death_certificate.date_of_death)

    full_name = (
        death_certificate.full_name
        or f"{_safe_attr(death_certificate, 'first_name')} {_safe_attr(death_certificate, 'last_name')}"
    )

    doctor_name = _safe_attr(death_certificate, "doctor_name", "[NOM DU MÉDECIN]")
    place_death = _safe_attr(death_certificate, "place_of_death", "[LIEU]")

    # Style
    attest_style = _get_attest_style()
    text_width = width - 2 * margin - 10 * mm

    # === PARAGRAPHE 1 : Introduction ===
    para1_text = (
        f"Je soussigné, <b>{doctor_name}</b>, "
        f"Officier de l'État Civil de la Commune de <b>{commune}</b>, atteste par la présente "
        f"qu'il ressort des documents en ma possession que :"
    )
    p1 = Paragraph(para1_text, attest_style)
    p1.wrapOn(c, text_width, 100 * mm)
    p1.drawOn(c, margin, y - p1.height)
    y -= p1.height + 8 * mm

    # === PARAGRAPHE 2 : Identité du défunt ===
    para2_text = f"<b>{full_name}</b>, {gender_label}."
    p2 = Paragraph(para2_text, attest_style)
    p2.wrapOn(c, text_width, 100 * mm)
    p2.drawOn(c, margin, y - p2.height)
    y -= p2.height + 8 * mm

    # === PARAGRAPHE 3 : Détails du décès ===
    para3_text = (
        f"{decede_forme.capitalize()} à <b>{place_death}</b>, {date_deces_courte}, "
        f"de nationalité congolaise, {est_forme} à "
        f"<b>{place_death}</b>, {date_deces}."
    )
    p3 = Paragraph(para3_text, attest_style)
    p3.wrapOn(c, text_width, 100 * mm)
    p3.drawOn(c, margin, y - p3.height)
    y -= p3.height + 12 * mm

    # === INFORMATIONS COMPLEMENTAIRES ===
    c.setFont("Helvetica-Bold", 10)
    c.setFillColor(RDC_RED)
    c.drawString(margin, y, "INFORMATIONS COMPLÉMENTAIRES :")
    y -= 7 * mm

    c.setFont("Helvetica", 9)
    c.setFillColor(TEXT_DARK)
    age = (
        f"{death_certificate.age_at_death} ans"
        if death_certificate.age_at_death
        else "Non spécifié"
    )
    hospital_name = _safe_hospital_name(death_certificate)
    decl_date = (
        death_certificate.declaration_date.strftime("%d/%m/%Y")
        if death_certificate.declaration_date
        else "Non spécifiée"
    )

    infos = [
        f"N° d'Acte de Décès : {death_certificate.certificate_id}",
        f"Cause du décès : {_safe_attr(death_certificate, 'cause_of_death', 'Non spécifiée')}",
        f"Catégorie : {_safe_attr(death_certificate, 'cause_category', 'Non spécifiée')}",
        f"Âge au décès : {age}",
        f"Nom du Médecin : {doctor_name}",
        f"N° Licence : {_safe_attr(death_certificate, 'doctor_license', 'Non spécifiée')}",
        f"Hôpital : {hospital_name}",
        f"Date de déclaration : {decl_date}",
        f"Statut : {death_certificate.get_status_display()}",
    ]

    for info in infos:
        c.drawString(margin + 5 * mm, y, f"\u2022 {info}")
        y -= 5.5 * mm

    # === SIGNATURE ===
    _draw_signature_block_v2(c, width, commune, doctor_name)

    # === PIED DE PAGE ===
    _draw_footer_v2(c, width, height, death_certificate.certificate_id)

    c.showPage()
    c.save()
    buffer.seek(0)

    if output_path:
        with open(output_path, "wb") as f:
            f.write(buffer.getvalue())

    return buffer
