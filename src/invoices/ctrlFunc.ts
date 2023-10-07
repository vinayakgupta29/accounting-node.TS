interface InvoiceActions {
    today: () => string;
    toAndFromDate: (sdate: string, endate: string) => string;
    thisMonth: () => string;
    thisWeek: () => string;
    thisQuarter: () => string;
    thisYear: () => string;
    beforeDate: (e: any, date: string) => string;
    afterDate: (date: string, e: any) => string;
    all: () => string;
}

const invoiceActions = {
    today: () => `WHERE DATE(date_time) = CURRENT_DATE`,
    toAndFromDate: (sdate: string, endate: string) =>
        `WHERE date_time BETWEEN '${sdate}' AND '${endate}'`,

    thisMonth: () =>
        `WHERE EXTRACT(MONTH FROM date_time) = EXTRACT(MONTH FROM CURRENT_DATE);`,

    thisWeek: () =>
        `WHERE EXTRACT(WEEK FROM date_time) = EXTRACT(WEEK FROM CURRENT_DATE);`,

    thisQuarter: () =>
        `WHERE CEIL(EXTRACT(MONTH FROM date_time) / 3.0) = CEIL(EXTRACT(MONTH FROM CURRENT_DATE) / 3.0);`,

    thisYear: () =>
        `WHERE EXTRACT(YEAR FROM date_time) = EXTRACT(YEAR FROM CURRENT_DATE);`,

    beforeDate: (e: any, date: string) => `WHERE date_time <= '${date}' `,

    afterDate: (date: string, e: any) => `WHERE date_time >= '${date}' `,
    all: () => ``,
};

export { InvoiceActions, invoiceActions }