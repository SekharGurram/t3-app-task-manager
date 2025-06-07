export const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const base64 = (reader.result as string).split(",")[1];
            if (!base64) {
                throw new Error("Base64 image data is missing");
            }
            resolve(base64);
        };
        reader.onerror = error => reject(error);
    });
};
