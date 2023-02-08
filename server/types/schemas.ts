import { z } from "zod";

const VolunteerDataSchema = z
  .object({
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

const HomeDataSchema = z
  .object({
    socialText: z.string(),
    socialButtons: z.object({
      instagramMarkdown: z.string(),
      discordMarkdown: z.string(),
      youtubeMarkdown: z.string(),
    }),
  })
  .strict();

const ElectionsDataSchema = z.array(
  z.object({
    term: z.string(),
    electionState: z.string(),
    candidates: z.array(
      z
        .object({
          name: z.string(),
          position: z.string(),
          elected: z.boolean(),
          platform: z.string(),
        })
        .strict()
    ),
    decisions: z.array(
      z
        .object({
          candidate: z.string(),
          date: z.string(),
          allegation: z.string().optional(),
          defense: z.string().optional(),
          decision: z.string().optional(),
          penalties: z.array(z.string()).optional(),
          penaltyDescription: z.string().optional(),
          appeal: z.string().optional(),
          appealDecision: z.string().optional(),
        })
        .strict()
    ),
  })
);

const MentalWellnessDataSchema = z.object({
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

const CartoonsAboutUsDataSchema = z.object({
  pageTitle: z.string(),
  heading: z.string(),
  coverPicSrc: z.string(),
  coverPicSrcMobile: z.string(),
  comicExample: z.string(),
  subheading: z.string(),
  subheadingCaption: z.string(),
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
  execs: z.array(
    z.object({
      name: z.string(),
      role: z.string(),
      email: z.string(),
      image: z.string(),
    })
  ),
});

export {
  VolunteerDataSchema,
  HomeDataSchema,
  ElectionsDataSchema,
  MentalWellnessDataSchema,
  CartoonsAboutUsDataSchema,
  CouncilDataSchema,
  ContactUsDataSchema,
  SharedFooterSchema,
  SharedExecsSchema,
};
