import { volunteerDataValidator } from "./validators";

export const mapping = {
    'get-involved/volunteer': volunteerDataValidator
}

export const getValidator = (filePath): ((data: any) => boolean) | undefined => {
    for (const [key, value] of Object.entries(mapping)) {
        if(key == filePath) {
            return value;
        }
    }
}