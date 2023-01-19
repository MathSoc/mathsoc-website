import { z } from 'zod';

const VolunteerDataSchema = z.object({
    title: z.string(),
    subtext: z.string(), 
    teams: z.array(z.object({
        name: z.string(),
        subheader: z.string().optional(),
        roles: z.array(z.object({
            title: z.string(),
            description: z.string(),
            link: z.string(),
        }).strict()),
    }).strict()),
    clubsTitle: z.string(),
    clubsSubheader: z.string()
}).strict();


export { VolunteerDataSchema };

