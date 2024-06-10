import { z } from "zod";

/**
 * It looks like you're modifying a schema!
 *
 * If you're editing an existing schema or deleting a schema, please write a simple migration
 * from the old version of data on our dev environments and live site to your new version.
 * You can do this in /server/data-migrating/migrations.ts.
 *
 * If you're adding a new schema, disregard this message :)
 */

const VolunteerDataSchema = z
  .object({
    lastMigrationId: z.string().datetime(),
    title: z.string(),
    subtext: z.string(),
    teams: z.array(
      z
        .object({
          name: z.string(),
          subheader: z.string().optional(),
          roles: z.array(
            z
              .object({
                title: z.string(),
                descriptionMarkdown: z.string(),
                link: z.string(),
                active: z.boolean(),
              })
              .strict()
          ),
        })
        .strict()
    ),
    clubsTitle: z.string(),
    clubsSubheaderMarkdown: z.string(),
  })
  .strict();

const VolunteerApplicationSchema = z
  .object({
    lastMigrationId: z.string().datetime(),
    programs: z.array(z.string()),
    terms: z.array(z.string()),
  })
  .strict();

const HomeDataSchema = z
  .object({
    lastMigrationId: z.string().datetime(),
    socialText: z.string(),
    socialButtons: z.object({
      instagramMarkdown: z.string(),
      discordMarkdown: z.string(),
      youtubeMarkdown: z.string(),
    }),
  })
  .strict();

const ElectionsDataSchema = z.object({
  lastMigrationId: z.string().datetime(),
  noElectionsMessage: z.string(),
  electionsData: z.array(
    z.object({
      term: z.string(),
      electionState: z.string(),
      candidates: z.array(
        z
          .object({
            name: z.string(),
            position: z.string(),
            elected: z.boolean(),
            platformMarkdown: z.string(),
          })
          .strict()
      ),
      decisions: z.array(
        z
          .object({
            candidate: z.string(),
            date: z.string(),
            allegationMarkdown: z.string().optional(),
            defenseMarkdown: z.string().optional(),
            decisionMarkdown: z.string().optional(),
            penalties: z.array(z.string()).optional(),
            penaltyDescriptionMarkdown: z.string().optional(),
            appealMarkdown: z.string().optional(),
            appealDecisionMarkdown: z.string().optional(),
          })
          .strict()
      ),
    })
  ),
});

const MentalWellnessDataSchema = z.object({
  lastMigrationId: z.string().datetime(),
  title: z.string(),
  subheader: z.string(),
  onCampus: z.string(),
  offCampus: z.string(),
  bottomText: z.string(),
  onCampusChildren: z.array(
    z
      .object({
        title: z.string(),
        text: z.array(z.string()),
        link: z.string(),
      })
      .strict()
  ),
  offCampusChildren: z.array(
    z
      .object({
        title: z.string(),
        text: z.array(z.string()),
        link: z.string(),
      })
      .strict()
  ),
});

const ChequeRequestSchema = z.object({
  lastMigrationId: z.string().datetime(),
  title: z.string(),
  formLinks: z.array(
    z
      .object({
        title: z.string(),
        link: z.string(),
      })
      .strict()
  ),
  process: z
    .object({
      header: z.string(),
      description: z.string(),
      requirementsSubheader: z.string(),
      requirements: z.array(
        z
          .object({
            descriptionMarkdown: z.string(),
          })
          .strict()
      ),
    })
    .strict(),
  additionalDocumentationItems: z
    .object({
      header: z.string(),
      items: z.array(
        z.object({
          title: z.string(),
          description: z.string(),
        })
      ),
    })
    .strict(),
  frequentlyAskedQuestions: z
    .object({
      header: z.string(),
      questions: z.array(
        z
          .object({
            question: z.string(),
            questionMarkdown: z.string(),
          })
          .strict()
      ),
    })
    .strict(),
  otherForms: z
    .object({
      header: z.string(),
      footnote: z.string(),
      forms: z.array(
        z
          .object({
            title: z.string(),
            link: z.string(),
          })
          .strict()
      ),
    })
    .strict(),
  mathSocFees: z
    .object({
      header: z.string(),
      description: z.string(),
    })
    .strict(),
});

const DiscordAccessSchema = z.object({
  lastMigrationId: z.string().datetime(),
  title: z.string(),
  subheader: z.string(),
  steps: z.array(
    z
      .object({
        title: z.string(),
        text: z.string(),
        img: z.string(),
      })
      .strict()
  ),
});

const StudentServicesSchema = z.object({
  lastMigrationId: z.string().datetime(),
  sections: z.array(
    z.object({
      title: z.string(),
      description: z.string(),
      subdescription: z.string(),
      items: z.array(
        z.object({
          item: z.string(),
        })
      ),
      contacts: z.array(
        z.object({
          contact: z.string(),
        })
      ),
      img: z.string(),
    })
  ),
});

const ServicesMathsocOffice = z
  .object({
    lastMigrationId: z.string().datetime(),
    title: z.string(),
    descriptionMarkdown: z.string(),
    services: z
      .object({
        rentals: z.object({
          title: z.string(),
          description: z.string(),
        }),
        printing: z.object({
          title: z.string(),
          description: z.string(),
        }),
        novelties: z.object({
          title: z.string(),
          description: z.string(),
        }),
      })
      .strict(),
    novelties: z.unknown({}), // intentionally not strict
    serviceMarkdown: z.string(),
  })
  .strict();

const CartoonsAboutUsDataSchema = z.object({
  lastMigrationId: z.string().datetime(),
  pageTitle: z.string(),
  heading: z.string(),
  coverPicSrc: z.string(),
  coverPicSrcMobile: z.string(),
  comicExample: z.string(),
  subheading: z.string(),
  subheadingCaptionMarkdown: z.string(),
  joinUs: z.string(),
  applicationsCaption: z.string(),
  signupMarkdown: z.string(),
  buttons: z.object({
    team: z
      .object({
        text: z.string(),
        link: z.string(),
      })
      .strict(),
    archive: z
      .object({
        text: z.string(),
        link: z.string(),
      })
      .strict(),
  }),
  carouselImages: z.array(z.string()),
  getInTouch: z.string(),
  socialButtons: z
    .object({
      instagramMarkdown: z.string(),
      facebookMarkdown: z.string(),
      feedbackMarkdown: z.string(),
      emailMarkdown: z.string(),
    })
    .strict(),
  socialLinks: z
    .object({
      instagram: z.string(),
      facebook: z.string(),
      feedback: z.string(),
      email: z.string(),
    })
    .strict(),
});

const CouncilDataSchema = z
  .object({
    lastMigrationId: z.string().datetime(),
    councilHeader: z.string(),
    councilResponse: z.string(),
    compositionOfCouncilHeader: z.string(),
    compositionOfCouncilMarkdown: z.string(),
    execsHeader: z.string(),
    councilRepHeader: z.string(),
    councilRepresentatives: z.array(
      z
        .object({
          name: z.string(),
          role: z.string(),
          email: z.string(),
          image: z.string(),
        })
        .strict()
    ),
  })
  .strict();

const ContactUsDataSchema = z.object({
  lastMigrationId: z.string().datetime(),
  staff: z.object({
    businessManager: z
      .object({
        name: z.string(),
        role: z.string(),
        email: z.string(),
      })
      .strict(),
  }),
  locations: z.array(
    z
      .object({
        name: z.string(),
        room: z.string(),
        img: z.string(),
      })
      .strict()
  ),
});

const SharedFooterSchema = z
  .object({
    lastMigrationId: z.string().datetime(),
    phoneNumber: z.string(),
    addressLine1: z.string(),
    addressLine2: z.string(),
    addressLine3: z.string(),
    socialLinks: z
      .object({
        facbook: z.string().optional(),
        twitter: z.string().optional(),
        instagram: z.string().optional(),
        mail: z.string().optional(),
        discord: z.string().optional(),
        youtube: z.string().optional(),
      })
      .strict(),
  })
  .strict();

const SharedExecsSchema = z.object({
  lastMigrationId: z.string().datetime(),
  execs: z.array(
    z.object({
      name: z.string(),
      role: z.string(),
      email: z.string(),
      image: z.string(),
    })
  ),
});

const ClubsSchema = z.object({
  lastMigrationId: z.string().datetime(),
  clubsHeader: z.string(),
  clubs: z.array(
    z.object({
      title: z.string(),
      descriptionMarkdown: z.string(),
      link: z.string(),
      icon: z.string(),
    })
  ),
});

const CommunitySchema = z
  .object({
    lastMigrationId: z.string().datetime(),
    communityHeader: z.string(),
    communities: z.array(
      z
        .object({
          title: z.string(),
          descriptionMarkdown: z.string(),
          link: z.string(),
          icon: z.string(),
        })
        .strict()
    ),
  })
  .strict();

const DocumentsBudgetsSchema = z
  .object({
    lastMigrationId: z.string().datetime(),
    descriptionMarkdown: z.string(),
    budgets: z.array(
      z
        .object({
          year: z.number(),
          fall: z.string(),
          winter: z.string(),
          spring: z.string(),
        })
        .strict()
    ),
  })
  .strict();

const DocumentsMeetingsSchema = z
  .object({
    lastMigrationId: z.string().datetime(),
    descriptionMarkdown: z.string(),
    meetingGroups: z.array(
      z
        .object({
          type: z.string(),
          meetings: z.array(
            z
              .object({
                term: z.number(),
                date: z.string(),
                agendaLink: z.string(),
                minutesLink: z.string(),
              })
              .strict()
          ),
        })
        .strict()
    ),
  })
  .strict();

const ImportantLinksSchema = z
  .object({
    title: z.string(),
    links: z.array(
      z
        .object({
          title: z.string(),
          link: z.string(),
        })
        .strict()
    ),
    icon: z.string(),
  })
  .strict();

export {
  CartoonsAboutUsDataSchema,
  ChequeRequestSchema,
  ClubsSchema,
  CommunitySchema,
  ContactUsDataSchema,
  CouncilDataSchema,
  DiscordAccessSchema,
  DocumentsBudgetsSchema,
  DocumentsMeetingsSchema,
  ElectionsDataSchema,
  HomeDataSchema,
  ImportantLinksSchema,
  MentalWellnessDataSchema,
  StudentServicesSchema,
  ServicesMathsocOffice,
  SharedFooterSchema,
  SharedExecsSchema,
  VolunteerApplicationSchema,
  VolunteerDataSchema,
};
