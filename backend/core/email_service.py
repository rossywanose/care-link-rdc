"""
Service d'emails pour Care-Link RDC.
Templates HTML professionnels avec design cohérent.
À placer dans : backend/core/email_service.py
"""

from django.core.mail import send_mail, EmailMultiAlternatives
from django.conf import settings
from django.utils.html import mark_safe
import logging

logger = logging.getLogger(__name__)


class EmailService:
    """Service centralisé d'envoi d'emails pour Care-Link RDC."""

    BRAND_COLORS = {
        "primary": "#6366f1",
        "primary_dark": "#4f46e5",
        "secondary": "#8b5cf6",
        "success": "#10b981",
        "warning": "#f59e0b",
        "danger": "#ef4444",
        "dark": "#1e293b",
        "light": "#f8fafc",
    }

    @classmethod
    def _build_html_email(cls, subject, content):
        """Construit l'email HTML complet avec le contenu fourni."""
        primary = cls.BRAND_COLORS["primary"]
        secondary = cls.BRAND_COLORS["secondary"]
        success = cls.BRAND_COLORS["success"]
        warning = cls.BRAND_COLORS["warning"]
        danger = cls.BRAND_COLORS["danger"]
        dark = cls.BRAND_COLORS["dark"]

        return f"""<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{subject}</title>
    <style>
        * {{ margin: 0; padding: 0; box-sizing: border-box; }}
        body {{
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f1f5f9;
            color: #334155;
            line-height: 1.6;
        }}
        .email-wrapper {{
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }}
        .email-header {{
            background: linear-gradient(135deg, {primary} 0%, {secondary} 100%);
            padding: 40px 30px;
            text-align: center;
        }}
        .email-header .logo-icon {{
            width: 64px;
            height: 64px;
            background: rgba(255,255,255,0.2);
            border-radius: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 16px;
            font-size: 32px;
        }}
        .email-header h1 {{
            color: #ffffff;
            font-size: 24px;
            font-weight: 700;
            margin-bottom: 8px;
        }}
        .email-header p {{
            color: rgba(255, 255, 255, 0.9);
            font-size: 14px;
        }}
        .email-body {{
            padding: 40px 30px;
        }}
        .email-body h2 {{
            color: {dark};
            font-size: 20px;
            font-weight: 600;
            margin-bottom: 16px;
        }}
        .email-body h3 {{
            color: {dark};
            font-size: 16px;
            font-weight: 600;
            margin-top: 24px;
            margin-bottom: 12px;
        }}
        .email-body p {{
            color: #64748b;
            font-size: 15px;
            margin-bottom: 16px;
            line-height: 1.7;
        }}
        .email-body strong {{
            color: {dark};
        }}
        .code-box {{
            background: linear-gradient(135deg, {primary} 0%, {secondary} 100%);
            color: #ffffff;
            font-size: 32px;
            font-weight: 700;
            letter-spacing: 8px;
            text-align: center;
            padding: 24px;
            border-radius: 12px;
            margin: 24px 0;
            font-family: 'Courier New', monospace;
        }}
        .btn {{
            display: inline-block;
            background: linear-gradient(135deg, {primary} 0%, {secondary} 100%);
            color: #ffffff !important;
            text-decoration: none;
            padding: 14px 32px;
            border-radius: 8px;
            font-weight: 600;
            font-size: 15px;
            margin: 16px 0;
        }}
        .btn-danger {{
            background: linear-gradient(135deg, {danger} 0%, #dc2626 100%) !important;
        }}
        .info-box {{
            background-color: #f8fafc;
            border-left: 4px solid {primary};
            padding: 16px 20px;
            border-radius: 0 8px 8px 0;
            margin: 20px 0;
        }}
        .info-box p {{
            margin-bottom: 0;
            font-size: 14px;
            color: #475569;
        }}
        .info-box strong {{
            color: {primary};
        }}
        .success-box {{
            background-color: #ecfdf5;
            border-left: 4px solid {success};
            padding: 16px 20px;
            border-radius: 0 8px 8px 0;
            margin: 20px 0;
        }}
        .success-box p {{
            margin-bottom: 0;
            font-size: 14px;
            color: #065f46;
        }}
        .warning-box {{
            background-color: #fef3c7;
            border-left: 4px solid {warning};
            padding: 16px 20px;
            border-radius: 0 8px 8px 0;
            margin: 20px 0;
        }}
        .warning-box p {{
            margin-bottom: 0;
            font-size: 14px;
            color: #92400e;
        }}
        .danger-box {{
            background-color: #fef2f2;
            border-left: 4px solid {danger};
            padding: 16px 20px;
            border-radius: 0 8px 8px 0;
            margin: 20px 0;
        }}
        .danger-box p {{
            margin-bottom: 0;
            font-size: 14px;
            color: #991b1b;
        }}
        .email-footer {{
            background-color: #f8fafc;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e2e8f0;
        }}
        .email-footer p {{
            color: #94a3b8;
            font-size: 13px;
            margin-bottom: 8px;
        }}
        .email-footer a {{
            color: {primary};
            text-decoration: none;
        }}
        .divider {{
            height: 1px;
            background: linear-gradient(90deg, transparent, {primary}, transparent);
            margin: 24px 0;
        }}
        .feature-list {{
            list-style: none;
            padding: 0;
            margin: 16px 0;
        }}
        .feature-list li {{
            padding: 8px 0;
            padding-left: 28px;
            position: relative;
            color: #64748b;
            font-size: 14px;
        }}
        .feature-list li::before {{
            content: "✓";
            position: absolute;
            left: 0;
            color: {success};
            font-weight: bold;
        }}
        .center {{ text-align: center; }}
        @media (max-width: 600px) {{
            .email-body {{ padding: 24px 20px; }}
            .email-header {{ padding: 30px 20px; }}
            .code-box {{ font-size: 24px; letter-spacing: 4px; }}
        }}
    </style>
</head>
<body>
    <div style="padding: 20px;">
        <div class="email-wrapper">
            <div class="email-header">
                <div class="logo-icon">🛡️</div>
                <h1>Care-Link RDC</h1>
                <p>Plateforme officielle de l'état civil</p>
            </div>
            <div class="email-body">
                {content}
            </div>
            <div class="divider"></div>
            <div class="email-footer">
                <p><strong>Care-Link RDC</strong></p>
                <p>République Démocratique du Congo</p>
                <p style="font-size: 12px; margin-top: 12px;">
                    Cet email a été envoyé automatiquement. Merci de ne pas y répondre.<br>
                    Si vous avez des questions, contactez-nous à 
                    <a href="mailto:support@carelink-rdc.com">support@carelink-rdc.com</a>
                </p>
                <p style="font-size: 11px; color: #cbd5e1; margin-top: 16px;">
                    © 2026 Care-Link RDC. Tous droits réservés.
                </p>
            </div>
        </div>
    </div>
</body>
</html>"""

    @classmethod
    def send_email(
        cls, to_email, subject, html_content, text_content=None, from_email=None
    ):
        """
        Envoie un email HTML avec fallback texte.
        """
        from_email = from_email or settings.DEFAULT_FROM_EMAIL

        # Construire le HTML complet
        full_html = cls._build_html_email(subject, html_content)

        # Fallback texte
        if text_content is None:
            text_content = (
                f"Care-Link RDC\n\n{subject}\n\nCet email contient du contenu HTML."
            )

        try:
            msg = EmailMultiAlternatives(
                subject=subject,
                body=text_content,
                from_email=from_email,
                to=[to_email],
            )
            msg.attach_alternative(full_html, "text/html")
            msg.send()
            logger.info(f"Email envoyé à {to_email}: {subject}")
            return True
        except Exception as e:
            logger.error(f"Erreur envoi email à {to_email}: {e}")
            if settings.DEBUG:
                print(f"\n{'='*60}")
                print(f"EMAIL (mode développement)")
                print(f"{'='*60}")
                print(f"To: {to_email}")
                print(f"Subject: {subject}")
                print(f"\n{text_content}")
                print(f"{'='*60}\n")
                return True
            return False

    @classmethod
    def send_password_reset(cls, to_email, first_name, reset_code):
        """Email de réinitialisation de mot de passe."""
        html = f"""
        <h2>Bonjour {first_name},</h2>
        <p>Vous avez demandé la réinitialisation de votre mot de passe sur <strong>Care-Link RDC</strong>.</p>
        <div class="code-box">{reset_code}</div>
        <div class="info-box">
            <p><strong>⏱️ Validité :</strong> Ce code est valable pendant <strong>30 minutes</strong>.</p>
        </div>
        <div class="warning-box">
            <p><strong>⚠️ Sécurité :</strong> Si vous n'avez pas fait cette demande, ignorez cet email et vérifiez la sécurité de votre compte.</p>
        </div>
        <p style="margin-top: 24px;">Cordialement,<br><strong>L'équipe Care-Link RDC</strong></p>
        """

        text = f"""Bonjour {first_name},

Vous avez demandé la réinitialisation de votre mot de passe sur Care-Link RDC.

Votre code de vérification est : {reset_code}

Ce code est valable pendant 30 minutes.

Si vous n'avez pas fait cette demande, ignorez cet email.

Cordialement,
L'équipe Care-Link RDC"""

        return cls.send_email(
            to_email=to_email,
            subject="Care-Link RDC — Réinitialisation de mot de passe",
            html_content=html,
            text_content=text,
        )

    @classmethod
    def send_welcome(cls, to_email, first_name, role):
        """Email de bienvenue après inscription."""
        role_labels = {
            "citizen": "Citoyen",
            "hospital": "Hôpital",
            "authority": "Autorité",
            "admin": "Administrateur",
        }
        role_label = role_labels.get(role, "Utilisateur")

        html = f"""
        <h2>Bienvenue sur Care-Link RDC, {first_name} ! 🎉</h2>
        <p>Votre compte <strong>{role_label}</strong> a été créé avec succès sur la plateforme officielle de gestion de l'état civil en RDC.</p>
        <div class="info-box">
            <p><strong>Votre rôle :</strong> {role_label}</p>
            <p style="margin-top: 8px;"><strong>Email :</strong> {to_email}</p>
        </div>
        <h3>✨ Ce que vous pouvez faire :</h3>
        <ul class="feature-list">
            <li>Enregistrer et consulter les actes de naissance</li>
            <li>Déclarer et suivre les certificats de décès</li>
            <li>Authentifier vos documents officiels</li>
            <li>Recevoir des notifications en temps réel</li>
            <li>Accéder à vos certificats numériques sécurisés</li>
        </ul>
        <div class="center" style="margin: 32px 0;">
            <a href="https://carelink-rdc.com/connexion" class="btn">Accéder à mon compte</a>
        </div>
        <div class="warning-box">
            <p><strong>🔒 Conseil de sécurité :</strong> Activez la validation en deux étapes dans vos paramètres pour sécuriser votre compte.</p>
        </div>
        <p style="margin-top: 24px;">Cordialement,<br><strong>L'équipe Care-Link RDC</strong></p>
        """

        text = f"""Bienvenue sur Care-Link RDC, {first_name} !

Votre compte {role_label} a été créé avec succès.

Ce que vous pouvez faire :
- Enregistrer et consulter les actes de naissance
- Déclarer et suivre les certificats de décès
- Authentifier vos documents officiels
- Recevoir des notifications en temps réel

Accédez à votre compte : https://carelink-rdc.com/connexion

Cordialement,
L'équipe Care-Link RDC"""

        return cls.send_email(
            to_email=to_email,
            subject="Bienvenue sur Care-Link RDC ! 🎉",
            html_content=html,
            text_content=text,
        )

    @classmethod
    def send_account_validated(cls, to_email, first_name, role):
        """Email de confirmation de validation de compte."""
        html = f"""
        <h2>Félicitations, {first_name} ! ✅</h2>
        <p>Votre compte <strong>Care-Link RDC</strong> a été <strong>validé</strong> par nos équipes.</p>
        <div class="success-box">
            <p><strong>✅ Votre compte est maintenant actif !</strong></p>
            <p style="margin-top: 8px;">Vous pouvez désormais accéder à toutes les fonctionnalités de la plateforme.</p>
        </div>
        <div class="center" style="margin: 32px 0;">
            <a href="https://carelink-rdc.com/connexion" class="btn">Se connecter</a>
        </div>
        <p style="margin-top: 24px;">Cordialement,<br><strong>L'équipe Care-Link RDC</strong></p>
        """

        text = f"""Félicitations, {first_name} !

Votre compte Care-Link RDC a été validé par nos équipes.

Votre compte est maintenant actif !

Connectez-vous : https://carelink-rdc.com/connexion

Cordialement,
L'équipe Care-Link RDC"""

        return cls.send_email(
            to_email=to_email,
            subject="Votre compte Care-Link RDC est validé ! ✅",
            html_content=html,
            text_content=text,
        )

    @classmethod
    def send_notification(
        cls,
        to_email,
        first_name,
        title,
        message,
        action_url=None,
        action_text="Voir les détails",
    ):
        """Email de notification générique."""
        action_html = (
            f'<div class="center" style="margin: 24px 0;"><a href="{action_url}" class="btn">{action_text}</a></div>'
            if action_url
            else ""
        )

        html = f"""
        <h2>Bonjour {first_name},</h2>
        <div class="info-box">
            <p><strong>📢 {title}</strong></p>
        </div>
        <p>{message}</p>
        {action_html}
        <p style="margin-top: 24px;">Cordialement,<br><strong>L'équipe Care-Link RDC</strong></p>
        """

        text = f"""Bonjour {first_name},

{title}

{message}

Cordialement,
L'équipe Care-Link RDC"""

        return cls.send_email(
            to_email=to_email,
            subject=f"Care-Link RDC — {title}",
            html_content=html,
            text_content=text,
        )

    @classmethod
    def send_certificate_ready(
        cls, to_email, first_name, certificate_type, certificate_number, download_url
    ):
        """Email de notification de certificat prêt."""
        type_labels = {
            "birth": "Acte de naissance",
            "death": "Certificat de décès",
        }
        type_label = type_labels.get(certificate_type, "Document")

        html = f"""
        <h2>Bonjour {first_name},</h2>
        <p>Votre <strong>{type_label}</strong> est maintenant disponible sur Care-Link RDC.</p>
        <div class="success-box">
            <p><strong>📄 Document :</strong> {type_label}</p>
            <p style="margin-top: 8px;"><strong>Numéro :</strong> {certificate_number}</p>
        </div>
        <div class="center" style="margin: 32px 0;">
            <a href="{download_url}" class="btn">📥 Télécharger le document</a>
        </div>
        <div class="warning-box">
            <p><strong>🔒 Important :</strong> Ce document est authentifié électroniquement. Conservez-le en lieu sûr.</p>
        </div>
        <p style="margin-top: 24px;">Cordialement,<br><strong>L'équipe Care-Link RDC</strong></p>
        """

        text = f"""Bonjour {first_name},

Votre {type_label} est maintenant disponible.

Numéro : {certificate_number}

Téléchargez-le : {download_url}

Cordialement,
L'équipe Care-Link RDC"""

        return cls.send_email(
            to_email=to_email,
            subject=f"Votre {type_label} est prêt ! 📄",
            html_content=html,
            text_content=text,
        )

    @classmethod
    def send_security_alert(
        cls, to_email, first_name, alert_type, details, action_url=None
    ):
        """Email d'alerte de sécurité."""
        alert_titles = {
            "login_new_device": "Nouvelle connexion détectée",
            "password_changed": "Mot de passe modifié",
            "suspicious_activity": "Activité suspecte détectée",
        }
        alert_title = alert_titles.get(alert_type, "Alerte de sécurité")

        action_html = (
            f'<div class="center" style="margin: 24px 0;"><a href="{action_url}" class="btn btn-danger">Sécuriser mon compte</a></div>'
            if action_url
            else ""
        )

        html = f"""
        <h2>Bonjour {first_name},</h2>
        <div class="danger-box">
            <p style="font-weight: 600;">🚨 {alert_title}</p>
            <p style="margin-top: 8px;">{details}</p>
        </div>
        <p>Si c'était vous, vous pouvez ignorer cet email. Sinon, nous vous recommandons de :</p>
        <ul class="feature-list">
            <li>Changer immédiatement votre mot de passe</li>
            <li>Vérifier vos sessions actives</li>
            <li>Activer la validation en deux étapes</li>
        </ul>
        {action_html}
        <p style="margin-top: 24px;">Cordialement,<br><strong>L'équipe Care-Link RDC</strong></p>
        """

        text = f"""Bonjour {first_name},

ALERTE : {alert_title}

{details}

Si ce n'était pas vous :
- Changez immédiatement votre mot de passe
- Vérifiez vos sessions actives
- Activez la validation en deux étapes

Cordialement,
L'équipe Care-Link RDC"""

        return cls.send_email(
            to_email=to_email,
            subject=f"🚨 Care-Link RDC — {alert_title}",
            html_content=html,
            text_content=text,
        )
