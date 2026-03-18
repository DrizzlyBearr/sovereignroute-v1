"""
SovereignRoute Seed Script
--------------------------
Populates the database with a demo workspace and real regulatory policies
covering GDPR, PIPL, LGPD, HIPAA, and national data localisation laws.

Run from the apps/api directory:
    python seed.py

Safe to run multiple times — skips if demo workspace already exists.
"""

import os
import sys
from pathlib import Path

from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent
load_dotenv(dotenv_path=BASE_DIR / ".env")

from sqlalchemy import create_engine, select, text
from sqlalchemy.orm import sessionmaker

DATABASE_URL = os.getenv("DATABASE_URL", "")
if DATABASE_URL.startswith("postgresql+psycopg://"):
    DATABASE_URL = DATABASE_URL.replace("postgresql+psycopg://", "postgresql+psycopg2://")
elif DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql+psycopg2://")

if not DATABASE_URL:
    print("ERROR: DATABASE_URL not set.")
    sys.exit(1)

engine = create_engine(DATABASE_URL)
Session = sessionmaker(bind=engine)

# ---------------------------------------------------------------------------
# Policy data — each entry is (country_code, data_type, restriction_level, notes, source_url, effective_date)
# ---------------------------------------------------------------------------
POLICIES = [
    # ── Russia ── Federal Law 242-FZ (Data Localisation)
    ("RU", "personal",   "prohibited", "Russia requires all personal data of Russian citizens to be stored on servers located within Russia. Transfer to foreign servers is prohibited without localisation first. (Federal Law 242-FZ)", "https://pd.rkn.gov.ru/", "2015-09-01"),
    ("RU", "health",     "prohibited", "Health data is classified as special-category personal data under Russian law and subject to strict localisation requirements. (Federal Law 323-FZ + 242-FZ)", "https://pd.rkn.gov.ru/", "2015-09-01"),
    ("RU", "financial",  "prohibited", "Financial data on Russian citizens must remain on Russian soil. Cross-border transfer requires explicit regulatory approval. (Federal Law 242-FZ)", "https://pd.rkn.gov.ru/", "2015-09-01"),
    ("RU", "biometric",  "prohibited", "Biometric personal data requires special consent and localisation under Russian law. Export is effectively prohibited. (Federal Law 149-FZ)", "https://pd.rkn.gov.ru/", "2015-09-01"),

    # ── China ── PIPL + DSSL
    ("CN", "personal",   "prohibited", "China's Personal Information Protection Law (PIPL) requires personal data to undergo a security assessment before cross-border transfer. Effectively blocked without MIIT approval.", "https://www.gov.cn/xinwen/2021-08/20/content_5632486.htm", "2021-11-01"),
    ("CN", "health",     "prohibited", "Health and medical data is classified as sensitive personal information under PIPL and subject to stricter consent and transfer restrictions. Cross-border transfer is blocked without CAC approval.", "https://www.gov.cn/xinwen/2021-08/20/content_5632486.htm", "2021-11-01"),
    ("CN", "financial",  "prohibited", "Financial data is subject to DSSL and PBOC regulations requiring localisation. Cross-border transfer requires regulatory filing and security review.", "https://www.gov.cn/xinwen/2021-09/01/content_5634857.htm", "2021-09-01"),
    ("CN", "biometric",  "prohibited", "Biometric data is explicitly listed as sensitive personal information under PIPL Article 28. Cross-border transfer requires separate consent and security assessment.", "https://www.gov.cn/xinwen/2021-08/20/content_5632486.htm", "2021-11-01"),
    ("CN", "location",   "high",       "Precise location data is considered sensitive personal information under PIPL. Transfer requires enhanced consent and a PIPL-compliant transfer mechanism.", "https://www.gov.cn/xinwen/2021-08/20/content_5632486.htm", "2021-11-01"),

    # ── European Union / Germany ── GDPR
    ("DE", "personal",   "high",       "GDPR applies. Personal data transfers to non-adequate third countries require SCCs, BCRs, or another valid transfer mechanism (GDPR Art. 46). Transfers to adequate countries (e.g. UK, Canada) are permitted.", "https://gdpr-info.eu/art-46-gdpr/", "2018-05-25"),
    ("DE", "health",     "high",       "Health data is special-category data under GDPR Art. 9. Processing and transfer requires explicit consent or another Art. 9(2) exception in addition to a standard transfer mechanism.", "https://gdpr-info.eu/art-9-gdpr/", "2018-05-25"),
    ("DE", "financial",  "high",       "Financial data may constitute personal data under GDPR. Transfers outside the EEA require a lawful transfer mechanism. German banking secrecy (Bankgeheimnis) adds additional constraints.", "https://gdpr-info.eu/art-46-gdpr/", "2018-05-25"),
    ("DE", "biometric",  "high",       "Biometric data is special-category data under GDPR Art. 9. Processing for identification purposes is restricted and transfer outside EEA requires both Art. 9 and Art. 46 compliance.", "https://gdpr-info.eu/art-9-gdpr/", "2018-05-25"),
    ("FR", "personal",   "high",       "GDPR applies in France. Cross-border transfers outside the EEA require adequacy decision or appropriate safeguards (Art. 46). CNIL actively enforces GDPR transfer rules.", "https://gdpr-info.eu/art-46-gdpr/", "2018-05-25"),
    ("FR", "health",     "high",       "Health data is special-category under GDPR. France additionally applies its national Health Data Hub rules for health data storage.", "https://gdpr-info.eu/art-9-gdpr/", "2018-05-25"),
    ("NL", "personal",   "high",       "GDPR applies in the Netherlands. The Dutch DPA (AP) has issued guidance that cloud transfers to US providers require SCCs with supplementary measures post-Schrems II.", "https://gdpr-info.eu/art-46-gdpr/", "2018-05-25"),

    # ── Brazil ── LGPD
    ("BR", "personal",   "high",       "Brazil's LGPD (Lei Geral de Proteção de Dados) restricts international transfers of personal data to countries with adequate protection or via contractual clauses approved by the ANPD.", "https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm", "2020-09-18"),
    ("BR", "health",     "high",       "Health data is sensitive data under LGPD Art. 11 requiring explicit consent or one of the listed legal bases. International transfer of sensitive data faces heightened scrutiny.", "https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm", "2020-09-18"),
    ("BR", "financial",  "high",       "Financial data may qualify as personal data under LGPD. Cross-border transfers require ANPD-approved mechanisms. Brazil's BACEN also has separate data residency guidance for financial institutions.", "https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm", "2020-09-18"),
    ("BR", "biometric",  "high",       "Biometric data is classified as sensitive data under LGPD Art. 5(II). Transfer requires explicit consent and appropriate cross-border safeguards.", "https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm", "2020-09-18"),

    # ── United States ── HIPAA + GLBA + CCPA
    ("US", "health",     "high",       "HIPAA governs Protected Health Information (PHI). Transfers to third parties require a Business Associate Agreement (BAA). International transfers must ensure equivalent protections.", "https://www.hhs.gov/hipaa/for-professionals/index.html", "1996-08-21"),
    ("US", "financial",  "medium",     "The Gramm-Leach-Bliley Act (GLBA) requires financial institutions to protect customer financial data. Cross-border transfers to processors are permitted with appropriate contractual protections.", "https://www.ftc.gov/business-guidance/privacy-security/gramm-leach-bliley-act", "2000-07-01"),
    ("US", "personal",   "medium",     "The US has no federal cross-border data transfer law, but CCPA (California) restricts sale and sharing of personal data. Sector-specific rules may apply.", "https://oag.ca.gov/privacy/ccpa", "2020-01-01"),
    ("US", "biometric",  "high",       "Illinois BIPA imposes strict requirements on collection and transfer of biometric data. Other states have similar laws. Cross-border transfers of biometric data face significant regulatory risk.", "https://www.ilga.gov/legislation/ilcs/ilcs3.asp?ActID=3004", "2008-10-03"),

    # ── India ── DPDP Act 2023
    ("IN", "personal",   "medium",     "India's Digital Personal Data Protection Act (DPDP Act 2023) permits cross-border transfer of personal data to countries notified by the central government. Restrictions apply to sensitive sectors.", "https://www.meity.gov.in/data-protection-framework", "2023-08-11"),
    ("IN", "health",     "high",       "Health data is classified as sensitive personal data under India's DPDP Act and earlier IT Rules. Transfer outside India requires explicit consent and compliance with sector-specific rules.", "https://www.meity.gov.in/data-protection-framework", "2023-08-11"),
    ("IN", "financial",  "high",       "RBI guidelines require certain financial and payment data to be stored exclusively in India. Cross-border transfer of payment system data is prohibited without RBI approval.", "https://www.rbi.org.in/Scripts/NotificationUser.aspx?Id=11244", "2018-10-15"),

    # ── Singapore ── PDPA
    ("SG", "personal",   "medium",     "Singapore's PDPA permits cross-border transfer if the recipient country provides comparable protection, or if contractual obligations ensure equivalent standards (PDPA Third Schedule).", "https://www.pdpc.gov.sg/Overview-of-PDPA/The-Legislation/Personal-Data-Protection-Act", "2014-07-02"),
    ("SG", "health",     "medium",     "Health data is treated as sensitive under PDPA guidelines. Cross-border transfer requires enhanced consent and may be subject to Ministry of Health sector-specific rules.", "https://www.pdpc.gov.sg/", "2014-07-02"),
    ("SG", "financial",  "medium",     "MAS (Monetary Authority of Singapore) guidelines require financial institutions to assess data confidentiality risks before any cross-border transfer of customer data.", "https://www.mas.gov.sg/regulation/guidelines/technology-risk-management-guidelines", "2021-01-18"),

    # ── Canada ── PIPEDA
    ("CA", "personal",   "medium",     "PIPEDA permits cross-border transfers for processing purposes, but organizations remain accountable and must use contractual means to ensure comparable protection (PIPEDA Principle 4.1.3).", "https://www.priv.gc.ca/en/privacy-topics/privacy-laws-in-canada/the-personal-information-protection-and-electronic-documents-act-pipeda/", "2001-01-01"),
    ("CA", "health",     "medium",     "Health data is subject to PIPEDA plus provincial health privacy laws (e.g. PHIPA in Ontario, HIA in Alberta). Cross-border transfers require safeguards ensuring equivalent protection.", "https://www.priv.gc.ca/en/", "2001-01-01"),

    # ── Australia ── Privacy Act
    ("AU", "personal",   "medium",     "Australia's Privacy Act APP 8 requires organisations to take reasonable steps to ensure overseas recipients protect personal data in a manner consistent with the APPs before transferring.", "https://www.oaic.gov.au/privacy/the-privacy-act", "1988-12-21"),
    ("AU", "health",     "high",       "Health information is sensitive information under the Privacy Act. My Health Records Act imposes additional restrictions on disclosure and cross-border transfer.", "https://www.oaic.gov.au/privacy/health-information", "1988-12-21"),

    # ── South Africa ── POPIA
    ("ZA", "personal",   "high",       "POPIA Section 72 prohibits transfer of personal information to foreign countries unless the recipient is subject to adequate data protection laws or the data subject consents.", "https://popia.co.za/section-72-transborder-information-flows/", "2021-07-01"),
    ("ZA", "health",     "high",       "Health data is special personal information under POPIA Section 26 requiring explicit consent for processing and cross-border transfer.", "https://popia.co.za/section-26-general-prohibition-on-processing-of-special-personal-information/", "2021-07-01"),
]

WORKSPACE_NAME = "SovereignRoute Demo"
WORKSPACE_INDUSTRY = "Technology"
WORKSPACE_COUNTRIES = [
    "RU", "CN", "DE", "FR", "NL", "BR", "US", "IN", "SG", "CA", "AU", "ZA"
]


def run():
    from app.core.base import Base
    import app.models.api_key   # noqa
    import app.models.policy    # noqa
    import app.models.workspace # noqa
    from app.models.policy import Policy
    from app.models.workspace import Workspace

    Base.metadata.create_all(bind=engine)

    with Session() as db:
        # Check if demo workspace already exists
        existing = db.scalar(select(Workspace).where(Workspace.name == WORKSPACE_NAME))
        if existing:
            print(f"Demo workspace already exists (id={existing.id}). Skipping.")
            print(f"Policy count: {db.execute(text('SELECT COUNT(*) FROM policies WHERE workspace_id = :wid'), {'wid': str(existing.id)}).scalar()}")
            return

        # Create demo workspace
        workspace = Workspace(
            name=WORKSPACE_NAME,
            industry=WORKSPACE_INDUSTRY,
            countries_json={"codes": WORKSPACE_COUNTRIES},
        )
        db.add(workspace)
        db.flush()  # get the ID before committing

        print(f"Created workspace: {workspace.name} (id={workspace.id})")

        # Insert policies
        count = 0
        for country_code, data_type, restriction_level, notes, source_url, effective_date in POLICIES:
            from datetime import date
            policy = Policy(
                workspace_id=workspace.id,
                country_code=country_code,
                data_type=data_type,
                restriction_level=restriction_level,
                notes=notes,
                source_url=source_url,
                effective_date=date.fromisoformat(effective_date),
            )
            db.add(policy)
            count += 1

        db.commit()
        print(f"Seeded {count} policies across {len(WORKSPACE_COUNTRIES)} countries.")
        print(f"\nDemo workspace ID: {workspace.id}")
        print("Use this ID to test route preview decisions in the API.")


if __name__ == "__main__":
    run()
