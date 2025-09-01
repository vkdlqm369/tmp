export interface Corp {
    idx: number;
    name: string;
    name_eng: string;
}

export interface Brand {
    name: string;
    code: string;
}


export interface CardImg {
    name: string;
    url: string;
}

export interface CardImgs {
    id: number;
    name: string;
    url: string;
}

export interface TopBenefit {
    idx: number | undefined | "";
    tags: string[];
    title: string;
}

export interface SearchBenefitOption {
    label: string;
    value: number;
}

export interface SearchBenefit {
    title: string;
    value: number;
    options: SearchBenefitOption[];
}

export interface KeyBenefit {
    cate: {
        idx: number | "";
        name: string;
    };
    // 혜택 1, 혜택 2와 같이 애매한 값 / 1678, 2273
    title: string;
    info: string;       // HTML 그대로
    comment: string;
}


export interface inputInfo {
    idx: number;
    cid: string;
    cate: "CRD" | "CHK";
    corp: Corp;
    name: string;
    brand: Brand[];
    pre_month_money: number;
    only_online: boolean;
    // null 대신 -> "없음"
    annual_fee_basic: string;
    annual_fee_detail: string | null;
    // 없으면 빈 list
    card_img: CardImg | [];
    card_imgs: CardImgs[];
    top_benefit: TopBenefit[];
    c_type: "P" | "D" | "M";
    search_benefit: SearchBenefit[];
    key_benefit: KeyBenefit[];
}
