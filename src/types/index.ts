export interface SectionData {
    section: string;
    hArea?: number;
    uArea?: number;
    chk: string;
    selected: boolean;
    beforeComposite: {
        mEnd: number;
        mMid: number;
        v: number;
    };
    afterComposite: {
        mEnd: number;
        mMid: number;
        v: number;
    };
}

export interface WTRatioResult {
    wtRatio?: number;
    lambda_p?: number;
    lambda_r?: number;
    check?: string;
}

export interface CheckItem {
    yieldStrength?: number;
    elasticMoment?: number;
    lateralBucklingStrength?: number; // For H_negative
    Lb?: number;
    Lp?: number;
    Lr?: number;

    shearCoefficient?: number; // For shear
    slendernessRatio?: number; // h/tw
    yieldLimit?: number;
    bucklingLimit?: number;

    requiredStrength?: number;
    designStrength?: number;
    ratio?: number;
    check?: string;

    flangeWT?: WTRatioResult;
    webWT?: WTRatioResult;
    bottomFlangeWT?: WTRatioResult;
}

export interface DeflectionResult {
    deflectionD1?: number;
    deflectionC?: number;
    totalDeflection?: number;
    limit?: number;
    check?: string;
}

export interface CompositeDeflectionResult {
    compositeRatio?: number;
    deflectionLive?: number;
    deflectionLiveLimit?: number;
    deflectionLiveCheck?: string;
    deflectionDeadLive?: number;
    deflectionDeadLiveLimit?: number;
    deflectionDeadLiveCheck?: string;
}

export interface VibrationResult {
    naturalFrequency?: number;
    maxAccelerationRatio?: number;
    accelerationLimit?: number;
}

/** DesignDialog 초기값용. API 계산 결과에 포함되는 파싱된 입력( H/U 단면 치수 ). */
export interface ParsedInputsHSection {
    height: number;
    width: number;
    webThickness: number;
    flangeThickness: number;
    bracketLength?: number;
}

export interface ParsedInputsUSection {
    height: number;
    width: number;
    thickness: number;
}

export interface ParsedInputs {
    hSection: ParsedInputsHSection;
    uSection: ParsedInputsUSection;
}

export interface SectionInfo {
    uArea?: number;
    hArea?: number;
    compositeArea?: number;
    uInertia?: number;
    hInertia?: number;
    compositeInertia?: number;
    uModulusX1?: number;
    hModulusX1?: number;
    compositeModulusX1?: number;
    uNeutralAxis?: number;
    hNeutralAxis?: number;
    compositeNeutralAxis?: number;
    uPlasticNeutralAxis?: number;
    hPlasticNeutralAxis?: number;
    compositePlasticNeutralAxis?: number;

    // String representation for UI (if needed)
    hSection?: string;
    uSection?: string;
}

export interface ConstructionStageResult {
    U_positive?: CheckItem;
    U_negative?: CheckItem;
    U_shear?: CheckItem;
    H_negative?: CheckItem;
    H_shear?: CheckItem;
    deflection?: DeflectionResult;
}

export interface CompositeStageResult {
    U_positive?: CheckItem;
    U_negative?: CheckItem;
    shear?: CheckItem;
    H_negative?: CheckItem;
    deflection?: CompositeDeflectionResult;
    vibration?: VibrationResult;
}

export interface DetailResult {
    sectionInfo?: SectionInfo;
    constructionStage?: ConstructionStageResult;
    compositeStage?: CompositeStageResult;
    materialInfo?: any; // Define structure if needed
    checkResult?: { [key: string]: boolean };
    error?: string;
    /** API 계산 결과에 포함되는 파싱된 입력 (H/U 단면 치수). DesignDialog 초기값에 사용. */
    parsedInputs?: ParsedInputs;
}

export interface DesignInputs {
    h_height?: string;
    h_width?: string;
    h_t1?: string;
    h_t2?: string;
    h_bracket_length?: string;
    u_height?: string;
    u_width?: string;
    u_thickness?: string;
}

export interface SearchInputs extends DesignInputs {
    selectedMember: string;
    rebarTopCount: string;
    rebarTopDia: string;
    rebarBotCount: string;
    rebarBotDia: string;
    fYr: string;
    studSpacing: string;
    angleSpacing: string;
    fYU: string;
    fYH: string;
    concrete: string;
    slabDs: string;
    slabBeff: string;
    support: string;
}
