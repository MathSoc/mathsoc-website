import { VolunteerDataSchema } from './types'

const volunteerDataValidator = (data) => {
    const parsed = VolunteerDataSchema.safeParse(data);
    return parsed.success;
}

export { volunteerDataValidator };
