---
description: Identifying high-value grants from grants.gov and sam.gov to maximize your project's ROI.
---

# Grants Autopilot Workflow

Systematically find, evaluate, and prioritize federal grants aligned with your organization's capabilities.

## Primary Data Sources

| Source | URL | Coverage |
|--------|-----|----------|
| **Grants.gov** | [grants.gov](https://www.grants.gov) | All federal grant opportunities |
| **SAM.gov** | [sam.gov](https://sam.gov) | Contracts, grants, entity registration |
| **SBIR.gov** | [sbir.gov](https://www.sbir.gov) | Small business innovation research |
| **NSF** | [nsf.gov](https://www.nsf.gov/funding/) | National Science Foundation |
| **DOE** | [energy.gov/eere](https://www.energy.gov/eere/funding-opportunities) | Department of Energy |

---

## Step 1: Define Your Grant Profile

Before searching, establish your eligibility and focus areas:

```markdown
## Organization Profile
- **Entity Type**: Small Business / Nonprofit / University / Individual
- **DUNS/UEI Number**: [Required for federal grants]
- **SAM.gov Registration**: Active? Expiration date?
- **NAICS Codes**: Primary industry classifications
- **Past Performance**: Previous grants awarded?

## Capability Areas
- AI/ML and autonomous systems
- Defense and national security
- Climate and clean energy
- Healthcare and biotech
- Aerospace and space tech

## Grant Size Sweet Spot
- Minimum: $50,000
- Maximum: $2,000,000
- Ideal: $100,000 - $500,000
```

---

## Step 2: Search Grants.gov

### Basic Search
1. Go to [grants.gov/search-grants](https://www.grants.gov/search-grants)
2. Filter by:
   - **Eligibility**: Small businesses, For-profit organizations
   - **Funding Instrument**: Grant, Cooperative Agreement
   - **Category**: Science and Technology, National Defense

### Advanced Search API

```javascript
// Grants.gov REST API
const searchParams = {
    keyword: 'artificial intelligence autonomous',
    oppStatus: 'posted',      // posted, forecasted, closed
    fundingInstruments: 'G',  // G=Grant, CA=Cooperative Agreement
    eligibilities: 23,        // 23=Small Business
    sortBy: 'closeDate'
};

const response = await fetch(
    `https://www.grants.gov/grantsws/rest/opportunities/search?${new URLSearchParams(searchParams)}`
);
```

---

## Step 3: Evaluate Opportunities

Score each opportunity (1-10) on these criteria:

| Criteria | Weight | Questions |
|----------|--------|-----------|
| **Technical Fit** | 30% | Does our tech directly solve their problem? |
| **Past Performance** | 20% | Do we have relevant prior work? |
| **Competition Level** | 15% | How many others will apply? Set-asides help. |
| **Award Amount** | 15% | Worth the effort? ROI positive? |
| **Timeline** | 10% | Can we meet the deadline? |
| **Relationship** | 10% | Do we have agency contacts? |

### Quick Disqualification Criteria
- ❌ Deadline < 3 weeks away (unless simple application)
- ❌ Requires capabilities we don't have
- ❌ Award amount < $25K (effort not worth it)
- ❌ Incumbent advantage we can't overcome
- ❌ Geographic restrictions we don't meet

---

## Step 4: Build Grant Pipeline

```markdown
## Active Pipeline

### Tier 1 - High Priority (Apply This Month)
| Opportunity | Agency | Amount | Deadline | Score | Status |
|-------------|--------|--------|----------|-------|--------|
| AI for Logistics | DoD | $500K | Feb 15 | 85 | Drafting |

### Tier 2 - Monitor (Apply Next Quarter)
| Opportunity | Agency | Amount | Deadline | Score | Status |
|-------------|--------|--------|----------|-------|--------|

### Tier 3 - Forecasted
| Opportunity | Agency | Est. Amount | Est. Date | Notes |
|-------------|--------|-------------|-----------|-------|
```

---

## Step 5: Application Checklist

### Pre-Application
- [ ] SAM.gov registration current
- [ ] Grants.gov account active
- [ ] UEI number obtained
- [ ] Authorized Organization Representative designated

### Application Components
- [ ] Technical Approach (10-15 pages)
- [ ] Past Performance references (3-5 projects)
- [ ] Budget and cost breakdown
- [ ] Team qualifications / resumes
- [ ] Facilities and equipment

### Submission
- [ ] Submit 48+ hours before deadline
- [ ] Confirm receipt in Grants.gov
- [ ] Download confirmation PDF

---

## SBIR/STTR Quick Reference

| Phase | Funding | Duration | Goal |
|-------|---------|----------|------|
| Phase I | $50K-$275K | 6-12 mo | Proof of concept |
| Phase II | $750K-$1.5M | 2 years | Prototype |
| Phase III | Commercial | Varies | Commercialization |

### Top SBIR Agencies
| Agency | Focus | Phase I Amount |
|--------|-------|----------------|
| DoD | Defense tech | $275K |
| NSF | General S&T | $275K |
| NIH | Healthcare | $275K |
| DOE | Energy | $200K |
| NASA | Aerospace | $150K |

---

## Automation Tips

### Email Alerts
- Grants.gov: "Subscribe" on search results
- SAM.gov: "Follow" searches

### Webhook Integration (Zapier/Make)
1. Monitor RSS feeds for new opportunities
2. Filter by keywords and amounts
3. Send Slack notification
4. Auto-create tracking entry

---

## Common Mistakes

1. **Missing the real requirement** — Read entire solicitation
2. **Ignoring evaluation criteria** — Match their scoring structure
3. **Weak past performance** — Frame tangential experience well
4. **Last-minute submission** — Technical issues happen
5. **Budget mismatch** — Stay within stated range
