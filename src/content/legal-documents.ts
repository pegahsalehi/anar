export type LegalDocumentSlug = "privacy" | "terms" | "disclaimer";

export type LegalBlock =
  | {
      kind: "paragraph";
      text: string;
    }
  | {
      kind: "list";
      items: string[];
    }
  | {
      id: string;
      kind: "subheading";
      text: string;
    };

export type LegalSection = {
  id: string;
  title: string;
  blocks: LegalBlock[];
};

export type LegalDocument = {
  effectiveDate: string;
  intro: string[];
  metadata: {
    description: string;
    title: string;
  };
  sections: LegalSection[];
  slug: LegalDocumentSlug;
  subtitle: string;
  title: string;
};

export const legalLinks: Array<{
  href: `/${LegalDocumentSlug}`;
  label: string;
}> = [
  {
    href: "/privacy",
    label: "Privacy Policy",
  },
  {
    href: "/terms",
    label: "Terms of Use",
  },
  {
    href: "/disclaimer",
    label: "Nutrition Disclaimer",
  },
];

export const legalDocuments: Record<LegalDocumentSlug, LegalDocument> = {
  privacy: {
    effectiveDate: "Effective date: [EFFECTIVE DATE]",
    intro: [
      "Anar is a personal nutrition-tracking application operated by [LEGAL OWNER OR COMPANY NAME]. This Privacy Policy explains what information we collect, why we use it, how it is stored, and the choices available to you.",
    ],
    metadata: {
      title: "Privacy Policy | Anar",
      description:
        "Learn how Anar collects, uses, stores, and protects account and nutrition information.",
    },
    sections: [
      {
        id: "information-we-collect",
        title: "1. Information we collect",
        blocks: [
          {
            id: "account-information",
            kind: "subheading",
            text: "Account information",
          },
          {
            kind: "paragraph",
            text: "When you create an account, we may collect:",
          },
          {
            kind: "list",
            items: [
              "Your email address",
              "Your display name",
              "Your selected profile avatar",
              "Account creation and authentication information",
            ],
          },
          {
            id: "nutrition-and-activity-information",
            kind: "subheading",
            text: "Nutrition and activity information",
          },
          {
            kind: "paragraph",
            text: "When you use Anar, you may choose to enter:",
          },
          {
            kind: "list",
            items: [
              "Saved foods and homemade recipes",
              "Calories and macronutrient values",
              "Daily nutrition targets",
              "Food-consumption history",
              "Serving amounts and timestamps",
              "Notes and favorite-food preferences",
              "Logging streak and activity information",
            ],
          },
          {
            id: "uploaded-content",
            kind: "subheading",
            text: "Uploaded content",
          },
          {
            kind: "paragraph",
            text: "If you add images to saved foods, we store the optimized versions of those images so they can be displayed in your personal food library.",
          },
          {
            id: "technical-and-security-information",
            kind: "subheading",
            text: "Technical and security information",
          },
          {
            kind: "paragraph",
            text: "Our authentication, hosting, and infrastructure providers may process limited technical information required to operate and protect the service, such as:",
          },
          {
            kind: "list",
            items: [
              "Session and authentication data",
              "Browser or device information",
              "IP address",
              "Request and security logs",
              "Error and diagnostic information",
            ],
          },
          {
            kind: "paragraph",
            text: "We do not intentionally collect precise location data, contacts, payment details, or information from other health services unless a future feature clearly asks for it.",
          },
        ],
      },
      {
        id: "how-we-use-your-information",
        title: "2. How we use your information",
        blocks: [
          {
            kind: "paragraph",
            text: "We use your information to:",
          },
          {
            kind: "list",
            items: [
              "Create and secure your account",
              "Provide your personal food library",
              "Calculate daily nutrition totals",
              "Display nutrition targets, history, and progress",
              "Store and display food images",
              "Synchronize your information across sessions",
              "Respond to support or account requests",
              "Detect abuse, errors, and security incidents",
              "Maintain and improve the reliability of the service",
            ],
          },
          {
            kind: "paragraph",
            text: "Anar does not use your nutrition history to provide medical diagnosis or treatment.",
          },
        ],
      },
      {
        id: "data-storage-and-service-providers",
        title: "3. Data storage and service providers",
        blocks: [
          {
            kind: "paragraph",
            text: "Anar currently uses Supabase for services that may include:",
          },
          {
            kind: "list",
            items: [
              "Authentication",
              "Database storage",
              "File storage",
              "Server-side infrastructure",
            ],
          },
          {
            kind: "paragraph",
            text: "These providers process information only as needed to support the operation and security of Anar and according to their own applicable terms and privacy documentation.",
          },
          {
            kind: "paragraph",
            text: "Do not add advertising, analytics, tracking pixels, or additional third-party services to this section unless they are actually used by the application.",
          },
        ],
      },
      {
        id: "selling-and-advertising",
        title: "4. Selling and advertising",
        blocks: [
          {
            kind: "paragraph",
            text: "Anar does not sell your personal information.",
          },
          {
            kind: "paragraph",
            text: "Anar does not use your nutrition logs or uploaded food information for targeted advertising.",
          },
          {
            kind: "paragraph",
            text: "If this practice changes, this Privacy Policy must be updated before the new use begins.",
          },
        ],
      },
      {
        id: "data-ownership-and-visibility",
        title: "5. Data ownership and visibility",
        blocks: [
          {
            kind: "paragraph",
            text: "Your saved foods, nutrition history, targets, uploaded images, and profile data are associated with your authenticated account.",
          },
          {
            kind: "paragraph",
            text: "Other Anar users should not be able to view or modify your private account data.",
          },
          {
            kind: "paragraph",
            text: "You retain ownership of the information and images you submit. You give Anar only the limited permission needed to store, process, resize, display, and back up that content for operation of the service.",
          },
        ],
      },
      {
        id: "data-retention",
        title: "6. Data retention",
        blocks: [
          {
            kind: "paragraph",
            text: "We retain your account information while your account remains active.",
          },
          {
            kind: "paragraph",
            text: "When you permanently delete your account, Anar will delete or anonymize account-linked information from active systems, subject to:",
          },
          {
            kind: "list",
            items: [
              "Limited backup retention",
              "Security and fraud-prevention records",
              "Legal obligations",
              "Technical delays required to complete deletion",
            ],
          },
          {
            kind: "paragraph",
            text: "Do not state a specific backup-retention period unless the actual provider configuration and retention process have been verified.",
          },
        ],
      },
      {
        id: "your-choices-and-rights",
        title: "7. Your choices and rights",
        blocks: [
          {
            kind: "paragraph",
            text: "Depending on your location, you may have the right to:",
          },
          {
            kind: "list",
            items: [
              "Access information associated with your account",
              "Correct inaccurate profile information",
              "Delete saved foods or nutrition entries",
              "Request a copy of your data",
              "Delete your account and associated information",
              "Object to or restrict certain uses of your information",
              "Withdraw consent where processing is based on consent",
              "Submit a complaint to an applicable privacy authority",
            ],
          },
          {
            kind: "paragraph",
            text: "You can update certain information from your Profile and Settings pages.",
          },
          {
            kind: "paragraph",
            text: "You can permanently delete your account from the Profile page when the account-deletion feature is available and fully operational.",
          },
          {
            kind: "paragraph",
            text: "For other requests, contact:",
          },
          {
            kind: "paragraph",
            text: "[CONTACT EMAIL]",
          },
          {
            kind: "paragraph",
            text: "We may need to verify your identity before completing a privacy request.",
          },
        ],
      },
      {
        id: "security",
        title: "8. Security",
        blocks: [
          {
            kind: "paragraph",
            text: "We use reasonable technical and organizational measures intended to protect account information.",
          },
          {
            kind: "paragraph",
            text: "However, no online service, storage system, or transmission method can be guaranteed to be completely secure.",
          },
          {
            kind: "paragraph",
            text: "You are responsible for:",
          },
          {
            kind: "list",
            items: [
              "Choosing a strong password",
              "Keeping your login details private",
              "Signing out on shared devices",
              "Reporting suspected unauthorized access",
            ],
          },
        ],
      },
      {
        id: "childrens-privacy",
        title: "9. Children’s privacy",
        blocks: [
          {
            kind: "paragraph",
            text: "Anar is not intended for children who cannot lawfully consent to the use of an online service in their country.",
          },
          {
            kind: "paragraph",
            text: "If you believe a child has provided personal information without appropriate authorization, contact us at [CONTACT EMAIL].",
          },
        ],
      },
      {
        id: "international-processing",
        title: "10. International processing",
        blocks: [
          {
            kind: "paragraph",
            text: "Depending on the selected hosting region and the operations of our infrastructure providers, information may be processed outside your country.",
          },
          {
            kind: "paragraph",
            text: "Where required, appropriate safeguards should be used for international data transfers.",
          },
        ],
      },
      {
        id: "changes-to-this-policy",
        title: "11. Changes to this policy",
        blocks: [
          {
            kind: "paragraph",
            text: "We may update this Privacy Policy when Anar’s features, providers, or legal obligations change.",
          },
          {
            kind: "paragraph",
            text: "Material changes should be communicated clearly. The effective date at the top of this page will show when the policy was last updated.",
          },
        ],
      },
      {
        id: "contact",
        title: "12. Contact",
        blocks: [
          {
            kind: "paragraph",
            text: "For privacy questions or requests, contact:",
          },
          {
            kind: "paragraph",
            text: "[LEGAL OWNER OR COMPANY NAME]",
          },
          {
            kind: "paragraph",
            text: "[CONTACT EMAIL]",
          },
          {
            kind: "paragraph",
            text: "[COUNTRY / JURISDICTION]",
          },
        ],
      },
    ],
    slug: "privacy",
    subtitle: "Learn how Anar collects, uses, stores, and protects your information.",
    title: "Privacy Policy",
  },
  terms: {
    effectiveDate: "Effective date: [EFFECTIVE DATE]",
    intro: [
      "These Terms of Use govern your access to and use of Anar.",
      "By creating an account or using Anar, you agree to these Terms. If you do not agree, do not create an account or use the service.",
    ],
    metadata: {
      title: "Terms of Use | Anar",
      description: "Review the terms that apply when creating an account and using Anar.",
    },
    sections: [
      {
        id: "about-anar",
        title: "1. About Anar",
        blocks: [
          {
            kind: "paragraph",
            text: "Anar is a personal food-library and nutrition-tracking tool.",
          },
          {
            kind: "paragraph",
            text: "It allows users to save foods, record meals, enter nutrition values, set daily targets, and review nutrition history.",
          },
          {
            kind: "paragraph",
            text: "Anar is not a healthcare provider, medical device, dietitian, or emergency service.",
          },
        ],
      },
      {
        id: "account-eligibility",
        title: "2. Account eligibility",
        blocks: [
          {
            kind: "paragraph",
            text: "You may use Anar only if you are legally permitted to enter into these Terms in your country.",
          },
          {
            kind: "paragraph",
            text: "You must provide accurate account information and keep it reasonably up to date.",
          },
          {
            kind: "paragraph",
            text: "You may not impersonate another person or create an account for unlawful or abusive purposes.",
          },
        ],
      },
      {
        id: "account-security",
        title: "3. Account security",
        blocks: [
          {
            kind: "paragraph",
            text: "You are responsible for:",
          },
          {
            kind: "list",
            items: [
              "Protecting your password",
              "Maintaining control of your account",
              "Signing out on shared devices",
              "Informing us about suspected unauthorized access",
            ],
          },
          {
            kind: "paragraph",
            text: "You are responsible for activity performed through your account unless it results from a security failure controlled by Anar.",
          },
        ],
      },
      {
        id: "user-entered-nutrition-information",
        title: "4. User-entered nutrition information",
        blocks: [
          {
            kind: "paragraph",
            text: "Anar relies primarily on information entered by users.",
          },
          {
            kind: "paragraph",
            text: "You are responsible for checking:",
          },
          {
            kind: "list",
            items: [
              "Food names",
              "Serving amounts",
              "Calories",
              "Protein",
              "Carbohydrates",
              "Fat",
              "Other nutrition values",
              "Product-label information",
            ],
          },
          {
            kind: "paragraph",
            text: "Nutrition values can vary by brand, recipe, preparation method, serving size, and data source.",
          },
          {
            kind: "paragraph",
            text: "Anar does not guarantee that user-entered or calculated nutrition information is complete, current, or accurate.",
          },
        ],
      },
      {
        id: "nutrition-targets",
        title: "5. Nutrition targets",
        blocks: [
          {
            kind: "paragraph",
            text: "Daily targets in Anar are tracking preferences selected by the user.",
          },
          {
            kind: "paragraph",
            text: "They are not medical prescriptions or personalized clinical recommendations.",
          },
          {
            kind: "paragraph",
            text: "Reaching, exceeding, or remaining below a target does not by itself indicate that a diet is healthy, safe, or appropriate for a particular person.",
          },
        ],
      },
      {
        id: "user-content",
        title: "6. User content",
        blocks: [
          {
            kind: "paragraph",
            text: "You may submit food names, nutrition information, notes, recipes, and food images.",
          },
          {
            kind: "paragraph",
            text: "You retain ownership of your content.",
          },
          {
            kind: "paragraph",
            text: "You give Anar a limited, non-exclusive permission to store, process, resize, display, and back up your content only as needed to operate and improve the service.",
          },
          {
            kind: "paragraph",
            text: "You must not upload content that:",
          },
          {
            kind: "list",
            items: [
              "Violates another person’s intellectual-property rights",
              "Contains unlawful or abusive material",
              "Contains malware or harmful code",
              "Violates privacy or publicity rights",
              "Attempts to interfere with the service",
            ],
          },
        ],
      },
      {
        id: "acceptable-use",
        title: "7. Acceptable use",
        blocks: [
          {
            kind: "paragraph",
            text: "You must not:",
          },
          {
            kind: "list",
            items: [
              "Access another user’s account or private data",
              "Attempt to bypass authentication or security controls",
              "Scrape or overload the service",
              "Reverse engineer protected parts of the service where prohibited",
              "Upload malicious files",
              "Use Anar for unlawful activity",
              "Misrepresent Anar as providing medical advice",
            ],
          },
        ],
      },
      {
        id: "no-medical-advice",
        title: "8. No medical advice",
        blocks: [
          {
            kind: "paragraph",
            text: "Anar provides general tracking and organizational features only.",
          },
          {
            kind: "paragraph",
            text: "Anar does not provide:",
          },
          {
            kind: "list",
            items: [
              "Medical advice",
              "Diagnosis",
              "Treatment",
              "Emergency assistance",
              "Allergy detection",
              "Clinical nutrition plans",
              "Professional dietary supervision",
            ],
          },
          {
            kind: "paragraph",
            text: "Consult a qualified healthcare professional before making significant dietary changes, especially if you have a medical condition, take medication, are pregnant, have an eating disorder, or have specialized nutritional needs.",
          },
        ],
      },
      {
        id: "allergies-and-food-safety",
        title: "9. Allergies and food safety",
        blocks: [
          {
            kind: "paragraph",
            text: "Anar does not verify ingredients, allergens, contamination risks, expiration dates, or food safety.",
          },
          {
            kind: "paragraph",
            text: "Always check the original product label and contact the manufacturer when necessary.",
          },
          {
            kind: "paragraph",
            text: "Do not rely on Anar to determine whether a food is safe for an allergy, intolerance, or medical restriction.",
          },
        ],
      },
      {
        id: "service-availability",
        title: "10. Service availability",
        blocks: [
          {
            kind: "paragraph",
            text: "We aim to keep Anar available and reliable, but we do not guarantee uninterrupted or error-free access.",
          },
          {
            kind: "paragraph",
            text: "The service may be changed, suspended, or temporarily unavailable because of:",
          },
          {
            kind: "list",
            items: [
              "Maintenance",
              "Security issues",
              "Provider outages",
              "Software errors",
              "Legal requirements",
              "Feature updates",
            ],
          },
          {
            kind: "paragraph",
            text: "You should keep independent copies of information that is important to you.",
          },
        ],
      },
      {
        id: "intellectual-property",
        title: "11. Intellectual property",
        blocks: [
          {
            kind: "paragraph",
            text: "The Anar name, logo, interface, software, and original design elements are owned by [LEGAL OWNER OR COMPANY NAME] or their applicable licensors.",
          },
          {
            kind: "paragraph",
            text: "These Terms do not transfer ownership of Anar’s software or branding to users.",
          },
        ],
      },
      {
        id: "account-suspension-and-termination",
        title: "12. Account suspension and termination",
        blocks: [
          {
            kind: "paragraph",
            text: "We may restrict or terminate an account if it is reasonably necessary to:",
          },
          {
            kind: "list",
            items: [
              "Prevent abuse or security risks",
              "Comply with the law",
              "Protect users or the service",
              "Address a material violation of these Terms",
            ],
          },
          {
            kind: "paragraph",
            text: "Where appropriate, we will attempt to provide notice.",
          },
          {
            kind: "paragraph",
            text: "You may stop using Anar at any time and may permanently delete your account through the available account-deletion process.",
          },
        ],
      },
      {
        id: "disclaimer-of-warranties",
        title: "13. Disclaimer of warranties",
        blocks: [
          {
            kind: "paragraph",
            text: "To the extent permitted by law, Anar is provided “as is” and “as available.”",
          },
          {
            kind: "paragraph",
            text: "We do not guarantee:",
          },
          {
            kind: "list",
            items: [
              "Perfect accuracy",
              "Continuous availability",
              "Compatibility with every device",
              "That the service will meet every dietary or health need",
              "That all user-entered information is correct",
            ],
          },
          {
            kind: "paragraph",
            text: "Nothing in these Terms excludes rights that cannot legally be excluded.",
          },
        ],
      },
      {
        id: "limitation-of-liability",
        title: "14. Limitation of liability",
        blocks: [
          {
            kind: "paragraph",
            text: "To the extent permitted by applicable law, [LEGAL OWNER OR COMPANY NAME] will not be liable for indirect, incidental, special, or consequential loss arising from:",
          },
          {
            kind: "list",
            items: [
              "Reliance on nutrition information",
              "User-entered errors",
              "Loss of access",
              "Loss of stored information",
              "Unauthorized account access outside our reasonable control",
              "Decisions made without professional medical advice",
            ],
          },
          {
            kind: "paragraph",
            text: "This limitation does not apply where liability cannot legally be limited.",
          },
        ],
      },
      {
        id: "changes-to-these-terms",
        title: "15. Changes to these Terms",
        blocks: [
          {
            kind: "paragraph",
            text: "We may update these Terms to reflect changes to the service, security requirements, providers, or applicable law.",
          },
          {
            kind: "paragraph",
            text: "Material changes should be communicated clearly before they take effect where required.",
          },
          {
            kind: "paragraph",
            text: "Continued use after the effective date of updated Terms constitutes acceptance where permitted by law.",
          },
        ],
      },
      {
        id: "governing-law",
        title: "16. Governing law",
        blocks: [
          {
            kind: "paragraph",
            text: "These Terms are governed by the laws of:",
          },
          {
            kind: "paragraph",
            text: "[COUNTRY / JURISDICTION]",
          },
          {
            kind: "paragraph",
            text: "Do not publish this section until the correct governing jurisdiction has been selected.",
          },
        ],
      },
      {
        id: "contact",
        title: "17. Contact",
        blocks: [
          {
            kind: "paragraph",
            text: "Questions about these Terms may be sent to:",
          },
          {
            kind: "paragraph",
            text: "[LEGAL OWNER OR COMPANY NAME]",
          },
          {
            kind: "paragraph",
            text: "[CONTACT EMAIL]",
          },
        ],
      },
    ],
    slug: "terms",
    subtitle: "The rules and responsibilities that apply when using Anar.",
    title: "Terms of Use",
  },
  disclaimer: {
    effectiveDate: "Effective date: [EFFECTIVE DATE]",
    intro: [
      "Anar is a personal nutrition-tracking and food-library tool.",
      "It is not a medical service and does not provide medical advice, diagnosis, treatment, emergency assistance, or professional dietary care.",
    ],
    metadata: {
      title: "Nutrition Disclaimer | Anar",
      description:
        "Important information about nutrition values, targets, allergies, and medical decisions in Anar.",
    },
    sections: [
      {
        id: "nutrition-data-may-be-inaccurate",
        title: "Nutrition data may be inaccurate",
        blocks: [
          {
            kind: "paragraph",
            text: "Nutrition values in Anar may be entered manually by users.",
          },
          {
            kind: "paragraph",
            text: "Values can differ because of:",
          },
          {
            kind: "list",
            items: [
              "Product formulation",
              "Brand",
              "Serving size",
              "Cooking method",
              "Recipe variation",
              "Label rounding",
              "Data-entry mistakes",
            ],
          },
          {
            kind: "paragraph",
            text: "Always verify important information using the original food label, manufacturer information, or another trusted source.",
          },
        ],
      },
      {
        id: "targets-are-not-prescriptions",
        title: "Targets are not prescriptions",
        blocks: [
          {
            kind: "paragraph",
            text: "Daily calorie and macronutrient targets are user-configured tracking values.",
          },
          {
            kind: "paragraph",
            text: "They are not automatically suitable for every person and should not be treated as medical or clinical recommendations.",
          },
        ],
      },
      {
        id: "professional-guidance",
        title: "Professional guidance",
        blocks: [
          {
            kind: "paragraph",
            text: "Consult a qualified doctor, registered dietitian, or other appropriate healthcare professional before making major dietary changes.",
          },
          {
            kind: "paragraph",
            text: "Professional guidance is particularly important if you:",
          },
          {
            kind: "list",
            items: [
              "Have a medical condition",
              "Take medication",
              "Are pregnant or breastfeeding",
              "Are underweight",
              "Have specialized nutritional requirements",
              "Have a history of disordered eating",
              "Are responsible for a child’s nutrition",
            ],
          },
        ],
      },
      {
        id: "allergies-and-intolerances",
        title: "Allergies and intolerances",
        blocks: [
          {
            kind: "paragraph",
            text: "Anar does not identify or verify allergens, cross-contamination, ingredients, or food-safety risks.",
          },
          {
            kind: "paragraph",
            text: "Never rely on Anar alone to decide whether a food is safe for an allergy, intolerance, or medical restriction.",
          },
        ],
      },
      {
        id: "emergency-situations",
        title: "Emergency situations",
        blocks: [
          {
            kind: "paragraph",
            text: "Anar is not an emergency service.",
          },
          {
            kind: "paragraph",
            text: "If you believe you are experiencing a medical emergency, contact your local emergency service immediately.",
          },
        ],
      },
      {
        id: "use-of-anar",
        title: "Use of Anar",
        blocks: [
          {
            kind: "paragraph",
            text: "You remain responsible for decisions made using information recorded or displayed in Anar.",
          },
          {
            kind: "paragraph",
            text: "Stop using any feature that negatively affects your health or wellbeing and seek appropriate professional support.",
          },
        ],
      },
    ],
    slug: "disclaimer",
    subtitle: "Important information about nutrition data and health decisions.",
    title: "Nutrition Disclaimer",
  },
};
