# Legal Document Revision Changelog

**Date:** 07.25.2026
**Purpose:** Record of all targeted revisions made to the NaijaAssets legal document suite following the comprehensive legal audit. Each audit finding was independently evaluated by Senior Legal Counsel; not all recommendations were accepted.

---

## Revision 1: Governing Law — Standardize to New Mexico

| Field | Value |
|-------|-------|
| **Documents** | 01_terms_of_service.md, 07_teacher_agreement.md, 08_affiliate_agreement.md, 09_scholarship_terms.md, 10_rewards_program_terms.md |
| **Source** | Audit Finding 1 |
| **Verdict** | **Accepted and Expanded** |
| **Change** | Replaced vague/variable governing law references with explicit "State of New Mexico, United States of America" clause. Added pre-incorporation / post-incorporation structure with automatic transition. |
| **Reasoning** | A floating "laws most appropriate to operations" is unenforceable. New Mexico is the planned incorporation state per the Company Spec. The pre/post structure gives legal certainty before and after incorporation without requiring amended agreements. |

---

## Revision 2: Arbitration Provider — Standardize to JAMS

| Field | Value |
|-------|-------|
| **Documents** | 01_terms_of_service.md, 07_teacher_agreement.md, 08_affiliate_agreement.md, 09_scholarship_terms.md, 10_rewards_program_terms.md |
| **Source** | Audit Findings 2, 6, 8 |
| **Verdict** | **Accepted** |
| **Change** | Replaced "mutually agreed arbitration provider" with "JAMS under its Streamlined Arbitration Rules." Added seat (New Mexico), language (English), single arbitrator, and equitable relief carveout. |
| **Reasoning** | "Mutually agreed" is unworkable — parties in dispute rarely agree on anything. JAMS is the second-most-recognized US arbitration provider (after AAA) and is appropriate for an education startup with consumer and B2B relationships. The equitable relief carveout protects IP in arbitration-bound agreements. |

---

## Revision 3: Liability Cap — $100 Floor

| Field | Value |
|-------|-------|
| **Documents** | 01_terms_of_service.md, 07_teacher_agreement.md, 08_affiliate_agreement.md, 09_scholarship_terms.md, 10_rewards_program_terms.md |
| **Source** | Audit Finding 3 |
| **Verdict** | **Modified** |
| **Change (ToS)** | Changed from "GREATER OF: fees paid OR $100" to "fees paid; if no fees paid, $100" |
| **Change (Other)** | Added "$100 floor if no compensation" to Teacher, Affiliate, Scholarship, Rewards caps |
| **Reasoning** | The original "greater of" formulation gave paying users a $100 floor that could be LESS than their fees paid — needless exposure. The revised formulation properly tracks paid fees for paying users while maintaining a $100 floor for free users. This protects the company against zero-dollar caps while respecting the fees-paid model for subscribers. The $100 floor is retained (not removed) because it provides essential protection for unpaid relationships. |

---

## Revision 4: Parent Definition — Add to ToS

| Field | Value |
|-------|-------|
| **Document** | 01_terms_of_service.md |
| **Source** | Audit Finding 4 |
| **Verdict** | **Accepted** |
| **Change** | Added "Parent" definition in §1 |
| **Reasoning** | The ToS references "parent or legal guardian" multiple times (§§3.1, 3.2) but never defined the term. Adding a formal definition improves enforceability and aligns with the Children's Privacy Notice and Parental Consent Policy. |

---

## Revision 5: Section 7 Renamed — "User Content" to "User Generated Content"

| Field | Value |
|-------|-------|
| **Document** | 01_terms_of_service.md |
| **Source** | Audit Finding 5 |
| **Verdict** | **Accepted** |
| **Change** | Renamed §7 from "User Content" to "User Generated Content". Updated ToC and cross-references in UGC Policy. |
| **Reasoning** | Aligns section name with the "User Generated Content Policy" consistent naming convention. The term "User Generated Content" is the industry-standard term (cf. YouTube, Facebook, Twitch Terms). |

---

## Revision 6: Grace Period Alignment — ToS and Payment Policy

| Field | Value |
|-------|-------|
| **Documents** | 01_terms_of_service.md (§5.4), 12_payment_policy.md (§5.1) |
| **Source** | Audit Finding 7 |
| **Verdict** | **Accepted** |
| **Change** | Changed both from "your Subscription access continues" / "you receive a five-day grace period" to "may continue at our discretion" |
| **Reasoning** | Guaranteed continued access during a grace period creates legal exposure if a technical issue prevents access restoration after late payment. Discretionary language preserves flexibility. Both documents now use identical language. |

---

## Revision 7: EU Withdrawal Right — Express Acknowledgment

| Field | Value |
|-------|-------|
| **Document** | 13_refund_policy.md (§3.2) |
| **Source** | Audit Finding 9 |
| **Verdict** | **Accepted** |
| **Change** | Replaced passive waiver language with explicit acknowledgment: "You expressly acknowledge... By clicking 'I agree'... you confirm your express request..." |
| **Reasoning** | Under EU Consumer Rights Directive 2011/83/EU, the right of withdrawal for digital content is waived only when (a) the consumer gives express prior consent, (b) acknowledges loss of withdrawal right, and (c) performance begins before expiry. The prior language failed all three requirements. The new language creates a clear record of express consent. No operational checkout flow is needed — the acknowledgment is integrated into account creation. |

---

## Revision 8: Export Controls — Add to ToS and AUP

| Field | Value |
|-------|-------|
| **Documents** | 01_terms_of_service.md (§9), 04_acceptable_use_policy.md (§1.1) |
| **Source** | Audit Finding 10 |
| **Verdict** | **Accepted** |
| **Change** | Added explicit reference to export control and OFAC sanctions to ToS prohibited conduct list and AUP illegal activities clause |
| **Reasoning** | US export control and sanctions laws apply to any US-nexus platform, regardless of company size. Missing these exposes the company to regulatory liability for user-caused violations. This is a bare-minimum compliance step. |

---

## Revision 9: Beta and Experimental Features — New Section

| Field | Value |
|-------|-------|
| **Document** | 01_terms_of_service.md (new §17) |
| **Source** | Audit Finding 11 |
| **Verdict** | **Accepted** |
| **Change** | Added standalone section covering beta/pilot/preview features with "AS IS" disclaimer, no-obligation, feedback license, and termination rights |
| **Reasoning** | The Product Spec describes frequent feature iteration and early-access programs. Without a dedicated beta section, users could claim reasonable expectations about feature completeness or continued availability. The new section is boilerplate-standard in the industry (cf. Google, Microsoft, Meta). |

---

## Revision 10: DMCA Physical Address — Placeholder

| Field | Value |
|-------|-------|
| **Document** | 14_dmca_policy.md |
| **Source** | Audit Finding 12 |
| **Verdict** | **Modified** |
| **Change** | Added "[Physical Address — To be provided upon incorporation]" placeholder to Designated Copyright Agent section |
| **Reasoning** | 17 U.S.C. §512(c)(2) requires the Register of Copyrights to maintain a directory of DMCA agents including address, but the statute requires the agent's name, address, phone number, and email. Without a physical address the DMCA safe harbor is technically compromised. A placeholder is used because no physical address exists pre-incorporation; this should be updated upon incorporation. |

---

## Revision 11: AI Benchmarking — Prohibit Without Consent

| Field | Value |
|-------|-------|
| **Document** | 06_ai_usage_policy.md (§6.2) |
| **Source** | Audit Finding 13 |
| **Verdict** | **Accepted** |
| **Change** | Added prohibition on using AI Features "to conduct benchmarking, competitive analysis, or testing designed to replicate, measure, or evaluate the performance of the Platform's AI systems without our prior written consent" |
| **Reasoning** | AI services are vulnerable to adversarial probing, model extraction, and competitive benchmarking. This clause is standard in SaaS and AI provider terms (cf. OpenAI, Anthropic, Google AI Terms). |

---

## Revision 12: Dispute Resolution — Add to Scholarship and Rewards Terms

| Field | Value |
|-------|-------|
| **Documents** | 09_scholarship_terms.md (new §§13-14), 10_rewards_program_terms.md (new §§13-14) |
| **Source** | Audit Findings 6, 8 |
| **Verdict** | **Accepted** |
| **Change** | Added full dispute resolution framework: informal resolution, JAMS arbitration, class action waiver, governing law (New Mexico) |
| **Reasoning** | Both documents previously lacked any dispute resolution or governing law clause. This meant any dispute would default to whatever jurisdiction a plaintiff chose, with no arbitration right. Adding standard provisions brings them in line with the rest of the document suite. |

---

## Revision 13: Cross-Reference Fixes

| Field | Value |
|-------|-------|
| **Documents** | 11_user_generated_content_policy.md |
| **Source** | Incidental |
| **Verdict** | **Corrective** |
| **Change** | Updated cross-references from "Section 7 — User Content" to "Section 7 — User Generated Content" in two locations |
| **Reasoning** | Section was renamed; cross-references must follow. |

---

## Revision 14: AFK — Class Action Waiver Enhancement

| Field | Value |
|-------|-------|
| **Documents** | 07_teacher_agreement.md, 08_affiliate_agreement.md, 09_scholarship_terms.md, 10_rewards_program_terms.md |
| **Source** | Audit Findings 6, 8 |
| **Verdict** | **Accepted** |
| **Change** | Added severability language to class action waivers: "If this waiver is held unenforceable, the entire dispute resolution provision shall be severed" |
| **Reasoning** | Without severability language, a court striking the class action waiver might sever only the waiver but leave arbitration intact — then the defendant faces individual claims in arbitration. The added language ensures that if the waiver falls, the entire arbitration agreement falls, preserving the right to litigate in court (which is actually favorable to the weaker position of having individual arbitration without class treatment). |

---

## Audit Recommendations Not Accepted

| # | Recommendation | Reason for Rejection |
|---|---------------|---------------------|
| 1 | Add Ambassador Program Policy and Marketplace Terms | The current Product Spec does not plan for ambassador programs or marketplace features. Adding policies for nonexistent products violates spec discipline and creates unnecessary user confusion. |
| 2 | Remove $100 liability cap entirely | The $100 floor is standard industry practice and provides essential protection for free users where damages might otherwise be uncapped. Cap retained in modified form (see Revision 3). |
| 3 | Add operational checkout EU withdrawal flow | The EU withdrawal acknowledgment requirement is satisfied by explicit consent language in the contract formation flow. Adding a separate checkout flow feature is unnecessary and is a product decision, not a legal drafting decision. |
