export interface Top {
    tags: string[];
    title: string;
}


export interface Toc {
    title: string;
    sub_titles: string[];
}

export interface Detail {
    title: string;
    info_html: string;
    comment: string;
}

export interface Benefits {
    top: Top[];
    toc: Toc[];
    details: Detail[];
}

export interface Notes {
    title: string;
    info_url: string;
    comment: string;
}

export interface IProcessedCardData {
    catalogId: number;
    type: "CRD" | "CHK";
    issuer: string;
    name: string;
    globalAcquirers: string[];
    targetMonthlySpending: number;
    onlyOnline: boolean;
    // null 대신 -> "없음"
    annualFee: string;
    annualFeeInternational: string ;
    c_type: "P" | "D" | "M";
    benefits: Benefits;
    notes : Detail[];
}