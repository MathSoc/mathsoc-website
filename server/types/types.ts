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
                description: z.string(),
                link: z.string(),
              })
              .strict()
          ),
        })
        .strict()
    ),
    clubsTitle: z.string(),
    clubsSubheader: z.string(),
  })
  .strict();

const HomeDataSchema = z
  .object({
    socialText: z.string(),
    socialButtons: z.object({
      instagram: z.string(),
      discord: z.string(),
      youtube: z.string(),
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
          election: z.boolean(),
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
          defence: z.string().optional(),
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
  signupMarkup: z.string(),
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
        linkt: z.string(),
      })
      .strict(),
  }),
  carouselImages: z.array(z.string()),
  getInTouch: z.string(),
  socialButtons: z
    .object({
      instagram: z.string(),
      facebook: z.string(),
      feedback: z.string(),
      email: z.string(),
    })
    .strict(),
  socialLints: z
    .object({
      instagram: z.string(),
      facebook: z.string(),
      feedback: z.string(),
      email: z.string(),
    })
    .strict(),
});

export {
  VolunteerDataSchema,
  HomeDataSchema,
  ElectionsDataSchema,
  MentalWellnessDataSchema,
  CartoonsAboutUsDataSchema,
};
