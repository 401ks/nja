window.NA_CONFIG = (function() {
  var C = {
    company: {
      name: "NaijaAssets",
      tagline: "Helping Nigerian students learn better.",
      description: "AI-first education platform making quality learning affordable and accessible for students in Nigeria.",
      url: "https://naijaassets.com",
      app_url: "https://app.naijaassets.com",
      year_founded: 2025,
      location: "Nigeria"
    },
    brand: {
      logo_light_bg: "/Logo.png",
      logo_dark_bg: "/Logo-nobg.png",
      bg_color: "#FBF8E9",
      primary_color: "#839C7C"
    },
    auth: {
      login_url: "https://app.naijaassets.com/login",
      signup_url: "https://app.naijaassets.com/signup",
      dashboard_url: "https://app.naijaassets.com/dashboard"
    },
    contact: {
      support_email: "legal@legal.naijaassets.com",
      legal_email: "legal@legal.naijaassets.com",
      contact_email: "legal@legal.naijaassets.com",
      forms_email: "forms@naijaassets.com"
    },
    social: {
      instagram: "/ig",
      facebook: "/fb",
      x: "/x",
      youtube: "/yt",
      tiktok: "/tt",
      linkedin: "/li"
    },
    forms: {
      primary: "https://formsubmit.co/forms@naijaassets.com",
      backup: "https://formspree.io/f/xeenyjkd",
      application: "https://formsubmit.co/forms@naijaassets.com",
      application_backup: "https://formspree.io/f/xeenyjkd"
    },
    growth: {
      monthly_creator_budget: 14000000,
      budget_display: "₦14M+",
      budget_full_display: "₦14 Million+",
      budget_description: "Available monthly for performance-based creator rewards, affiliate payouts, and community campaigns.",
      budget_disclaimer: "All rewards and payouts are discretionary and based on measurable results. No guaranteed earnings."
    },
    currencies: {
      default: "NGN",
      available: ["NGN", "USD"],
      symbols: { NGN: "₦", USD: "$" },
      exchange_rate_ngn_to_usd: 1500
    },
    subscriptions: {
      plans: [
        { id: "subject", name: "Subject Subscription", price_ngn: 15000, price_usd: 10, price_display: "15,000" },
        { id: "rex", name: "Rex", price_ngn: 17000, price_usd: 11, price_display: "17,000" },
        { id: "rex-pro", name: "Rex Pro", price_ngn: 35000, price_usd: 22, price_display: "35,000", popular: true },
        { id: "vault-pass", name: "Vault Pass", price_ngn: 45000, price_usd: 29, price_display: "45,000" }
      ]
    },
    affiliate: {
      tiers: [
        { name: "Base Tier", rate: "10%", description: "Commission on every referred student's first month" },
        { name: "Growth Tier", rate: "15%", description: "After 5+ active referrals - recurring monthly" },
        { name: "Partner Tier", rate: "20%", description: "After 20+ active referrals - maximum rate" }
      ]
    },
    features: {
      ai_coming_soon: true,
      scholarships_active: true,
      rewards_active: true,
      affiliate_active: true,
      teacher_program_active: true
    },
    seo: {
      default_title: "NaijaAssets - Helping Nigerian Students Learn Better",
      default_description: "Live classes, recorded lessons, and AI-powered tools for Nigerian students. Affordable monthly subscriptions.",
      default_og_image: "/og-image.png"
    }
  };
  function resolve(path, obj) {
    return path.split('.').reduce(function(p, s) {
      if (p && typeof p === 'object' && s in p) return p[s];
      if (p && Array.isArray(p) && /^\d+$/.test(s)) return p[parseInt(s)];
      return undefined;
    }, obj);
  }
  function renderConfig() {
    var els = document.querySelectorAll('[data-config]');
    for (var i = 0; i < els.length; i++) {
      var val = resolve(els[i].getAttribute('data-config'), C);
      if (val !== undefined && val !== null) {
        if (els[i].tagName === 'META') {
          els[i].setAttribute('content', String(val));
        } else if (els[i].tagName === 'INPUT') {
          els[i].value = String(val);
        } else if (els[i].tagName === 'IMG') {
          els[i].src = String(val);
        } else {
          els[i].textContent = String(val);
        }
      }
    }
  }
  function updateLogo() {
    var logos = document.querySelectorAll('.logo-img');
    for (var i = 0; i < logos.length; i++) {
      var bg = window.getComputedStyle(logos[i].closest('.logo') || logos[i].parentElement).backgroundColor;
      if (bg === 'rgb(251, 248, 233)') {
        logos[i].src = C.brand.logo_light_bg;
      } else {
        logos[i].src = C.brand.logo_dark_bg;
      }
    }
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() { updateLogo(); renderConfig(); });
  } else {
    updateLogo(); renderConfig();
  }
  return C;
})();
