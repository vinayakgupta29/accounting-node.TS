const cleanAlphanumeric = (value: any) => {
    return value.trim().replace(/[^A-Za-z0-9]/g, "");
};

export { cleanAlphanumeric };
