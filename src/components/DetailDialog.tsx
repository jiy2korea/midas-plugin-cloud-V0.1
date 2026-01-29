import React from 'react';
import { Dialog } from '@midasit-dev/moaui';

import { DetailResult } from '../types';

interface DetailDialogProps {
    open: boolean;
    setOpen: (open: boolean) => void;
    title: string;
    data: DetailResult | undefined;
}

const DetailDialog: React.FC<DetailDialogProps> = ({ open, setOpen, title, data }) => {
    const result = data;
    const sectionInfo = result?.sectionInfo || {};
    const constructionStage = result?.constructionStage || {};
    const compositeStage = result?.compositeStage || {};

    // Common Tailwind Classes
    const tableClass = "w-full border-collapse text-xs mb-2.5";
    const thClass = "border border-[#999] p-1.5 text-left bg-[#e8e8e8] font-normal";
    const tdClass = "border border-[#999] p-1.5";
    const tdRightClass = `${tdClass} text-right`;
    const tdCenterClass = `${tdClass} text-center`;
    const sectionDividerClass = "border-t-[2px] border-[#999] my-5";
    const subsectionTitleClass = "mt-[15px] mb-2.5 font-bold text-sm";

    // Helper to render OK/NG with color
    const renderCheck = (check: string | undefined) => {
        if (!check) return '-';
        return (
            <span className={check === 'NG' ? 'text-ng' : ''}>
                {check}
            </span>
        );
    };

    // Sub-component for repetitive tables? 
    // For now, keeping the structure as is to minimize logical changes, just replacing styles.

    return (
        <Dialog
            open={open}
            setOpen={setOpen}
            headerTitle={title}
        >
            <div className="w-[800px] max-w-[90vw]">
                {!result ? (
                    <div className="p-10 text-center text-gray-500">
                        계산 결과 데이터가 없습니다.
                    </div>
                ) : (
                    <div className="max-h-[70vh] overflow-y-auto p-2.5">
                        {/* 0. Section Properties */}
                        <div>
                            <div className={subsectionTitleClass}>0. Section Properties</div>

                            <table className={tableClass}>
                                <thead>
                                    <tr>
                                        <th className={`${thClass} w-[20%]`}>항목</th>
                                        <th className={`${thClass} text-center w-[20%]`}>U-section</th>
                                        <th className={`${thClass} text-center w-[20%]`}>H-section</th>
                                        <th className={`${thClass} text-center w-[20%]`}>Composite section</th>
                                        <th className={`${thClass} text-center`}>단위</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td className={`${tdClass} w-[20%]`}>Area</td>
                                        <td className={`${tdRightClass} w-[20%]`}>{sectionInfo.uArea?.toFixed(2) || '-'}</td>
                                        <td className={`${tdRightClass} w-[20%]`}>{sectionInfo.hArea?.toFixed(2) || '-'}</td>
                                        <td className={`${tdRightClass} w-[20%]`}>{sectionInfo.compositeArea?.toFixed(2) || '-'}</td>
                                        <td className={tdCenterClass}>mm²</td>
                                    </tr>
                                    <tr>
                                        <td className={`${tdClass} w-[20%]`}>Inertia</td>
                                        <td className={`${tdRightClass} w-[20%]`}>{sectionInfo.uInertia?.toLocaleString() || '-'}</td>
                                        <td className={`${tdRightClass} w-[20%]`}>{sectionInfo.hInertia?.toLocaleString() || '-'}</td>
                                        <td className={`${tdRightClass} w-[20%]`}>{sectionInfo.compositeInertia?.toLocaleString() || '-'}</td>
                                        <td className={tdCenterClass}>mm⁴</td>
                                    </tr>
                                    <tr>
                                        <td className={`${tdClass} w-[20%]`}>Section Modulus</td>
                                        <td className={`${tdRightClass} w-[20%]`}>{sectionInfo.uModulusX1?.toFixed(2) || '-'}</td>
                                        <td className={`${tdRightClass} w-[20%]`}>{sectionInfo.hModulusX1?.toFixed(2) || '-'}</td>
                                        <td className={`${tdRightClass} w-[20%]`}>{sectionInfo.compositeModulusX1?.toFixed(2) || '-'}</td>
                                        <td className={tdCenterClass}>mm³</td>
                                    </tr>
                                    <tr>
                                        <td className={`${tdClass} w-[20%]`}>Neutral Axis</td>
                                        <td className={`${tdRightClass} w-[20%]`}>{sectionInfo.uNeutralAxis?.toFixed(2) || '-'}</td>
                                        <td className={`${tdRightClass} w-[20%]`}>{sectionInfo.hNeutralAxis?.toFixed(2) || '-'}</td>
                                        <td className={`${tdRightClass} w-[20%]`}>{sectionInfo.compositeNeutralAxis?.toFixed(2) || '-'}</td>
                                        <td className={tdCenterClass}>mm</td>
                                    </tr>
                                    <tr>
                                        <td className={`${tdClass} w-[20%]`}>Plastic Neutral Axis</td>
                                        <td className={`${tdRightClass} w-[20%]`}>{sectionInfo.uPlasticNeutralAxis?.toFixed(2) || '-'}</td>
                                        <td className={`${tdRightClass} w-[20%]`}>{sectionInfo.hPlasticNeutralAxis?.toFixed(2) || '-'}</td>
                                        <td className={`${tdRightClass} w-[20%]`}>{sectionInfo.compositePlasticNeutralAxis?.toFixed(2) || '-'}</td>
                                        <td className={tdCenterClass}>mm</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        {/* 구분선 */}
                        <div className={sectionDividerClass}></div>

                        {/* 1. Construction Stage */}
                        <div>
                            <div className={subsectionTitleClass}>1. Construction Stage</div>

                            {/* 1-1. U-section */}
                            <div className={`${subsectionTitleClass} mt-2.5`}>1-1. U-section (KDS 14 31 10)</div>

                            <div className="border border-[#ccc] bg-white mt-2.5 text-xs">
                                <div className="p-2 border-b border-[#ccc]">
                                    <div className="font-bold mb-[5px]">1) Positive Bending (4.3.2.1.1.6 약축 휨을 받는 H형강 또는 ㄷ형강 부재)</div>
                                    <table className="border-collapse w-full mt-2">
                                        <tbody>
                                            <tr><td className="p-[4px_8px] text-left" colSpan={6}>(1) 항복강도</td></tr>
                                            <tr>
                                                <td className="p-[4px_8px] text-left w-[5%]"></td>
                                                <td className="p-[4px_8px] text-left w-[20%]">Mn=My=FySx=</td>
                                                <td className="p-[4px_8px] text-left w-[20%]">{constructionStage.U_positive?.yieldStrength?.toFixed(2) || '-'} kN-m</td>
                                                <td className="p-[4px_8px] text-left" colSpan={3}>※ 시공시 탄성강도 검토</td>
                                            </tr>
                                            <tr><td className="p-[4px_8px] text-left" colSpan={6}>(2) 플랜지 국부좌굴 검토</td></tr>
                                            <tr>
                                                <td className="p-[4px_8px] text-left w-[5%]"></td>
                                                <td className="p-[4px_8px] text-left w-[20%]">상부플랜지</td>
                                                <td className="p-[4px_8px] text-left w-[18.33%]">λ = {constructionStage.U_positive?.flangeWT?.wtRatio?.toFixed(2) || '-'}</td>
                                                <td className="p-[4px_8px] text-left w-[18.33%]">λₚ = {constructionStage.U_positive?.flangeWT?.lambda_p?.toFixed(2) || '-'}</td>
                                                <td className="p-[4px_8px] text-left w-[18.33%]">λᵣ = {constructionStage.U_positive?.flangeWT?.lambda_r?.toFixed(2) || '-'}</td>
                                                <td className="p-[4px_8px] text-left font-bold">=&gt; {renderCheck(constructionStage.U_positive?.flangeWT?.check)}</td>
                                            </tr>
                                            <tr><td className="p-[4px_8px] text-left" colSpan={6}>(3) Check</td></tr>
                                            <tr>
                                                <td className="p-[4px_8px] text-left w-[5%]"></td>
                                                <td className="p-[4px_8px] text-left w-[20%]">Mu= {constructionStage.U_positive?.requiredStrength?.toFixed(2) || '-'} kN-m</td>
                                                <td className="p-[4px_8px] text-left w-[20%]">ΦMn= {constructionStage.U_positive?.designStrength?.toFixed(2) || '-'} kN-m</td>
                                                <td className="p-[4px_8px] text-left font-bold" colSpan={3}>Mu/ΦMn= {constructionStage.U_positive?.ratio?.toFixed(2) || '-'} =&gt; {renderCheck(constructionStage.U_positive?.check)}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>

                                <div className="p-2 border-b border-[#ccc]">
                                    <div className="font-bold mb-[5px]">2) Negative Bending (4.3.2.1.1.6 약축 휨을 받는 H형강 또는 ㄷ형강 부재)</div>
                                    <table className="border-collapse w-full mt-2">
                                        <tbody>
                                            <tr><td className="p-[4px_8px] text-left" colSpan={6}>(1) 항복강도</td></tr>
                                            <tr>
                                                <td className="p-[4px_8px] text-left w-[5%]"></td>
                                                <td className="p-[4px_8px] text-left w-[20%]">Mn=My=FySx=</td>
                                                <td className="p-[4px_8px] text-left w-[20%]">{constructionStage.U_negative?.yieldStrength?.toFixed(2) || '-'} kN-m</td>
                                                <td className="p-[4px_8px] text-left" colSpan={3}>※ 시공시 탄성강도 검토</td>
                                            </tr>
                                            <tr><td className="p-[4px_8px] text-left" colSpan={6}>(2) 플랜지 국부좌굴 검토</td></tr>
                                            <tr>
                                                <td className="p-[4px_8px] text-left w-[5%]"></td>
                                                <td className="p-[4px_8px] text-left w-[20%]">하부플랜지</td>
                                                <td className="p-[4px_8px] text-left w-[18.33%]">λ = {constructionStage.U_negative?.flangeWT?.wtRatio?.toFixed(2) || '-'}</td>
                                                <td className="p-[4px_8px] text-left w-[18.33%]">λₚ = {constructionStage.U_negative?.flangeWT?.lambda_p?.toFixed(2) || '-'}</td>
                                                <td className="p-[4px_8px] text-left w-[18.33%]">λᵣ = {constructionStage.U_negative?.flangeWT?.lambda_r?.toFixed(2) || '-'}</td>
                                                <td className="p-[4px_8px] text-left font-bold">=&gt; {renderCheck(constructionStage.U_negative?.flangeWT?.check)}</td>
                                            </tr>
                                            <tr><td className="p-[4px_8px] text-left" colSpan={6}>(3) Check</td></tr>
                                            <tr>
                                                <td className="p-[4px_8px] text-left w-[5%]"></td>
                                                <td className="p-[4px_8px] text-left w-[20%]">Mu= {constructionStage.U_negative?.requiredStrength?.toFixed(2) || '-'} kN-m</td>
                                                <td className="p-[4px_8px] text-left w-[20%]">ΦMn= {constructionStage.U_negative?.designStrength?.toFixed(2) || '-'} kN-m</td>
                                                <td className="p-[4px_8px] text-left font-bold" colSpan={3}>Mu/ΦMn= {constructionStage.U_negative?.ratio?.toFixed(2) || '-'} =&gt; {renderCheck(constructionStage.U_negative?.check)}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>

                                <div className="p-2">
                                    <div className="font-bold mb-[5px]">3) Shear (4.3.2.1.2.2 웨브가 수직보강재에 의해 보강 또는 보강되지 않은 부재)</div>
                                    <table className="border-collapse w-full mt-2">
                                        <tbody>
                                            <tr><td className="p-[4px_8px] text-left" colSpan={5}>(1) 전단항복강도</td></tr>
                                            <tr>
                                                <td className="p-[4px_8px] text-left w-[5%]"></td>
                                                <td className="p-[4px_8px] text-left w-[20%]">Vn=0.6FyAw=</td>
                                                <td className="p-[4px_8px] text-left w-[20%]">{constructionStage.U_shear?.yieldStrength?.toFixed(1) || '-'} kN</td>
                                                <td className="p-[4px_8px] text-left" colSpan={2}></td>
                                            </tr>
                                            <tr><td className="p-[4px_8px] text-left" colSpan={5}>(2) 전단좌굴감소계수</td></tr>
                                            <tr>
                                                <td className="p-[4px_8px] text-left w-[5%]"></td>
                                                <td className="p-[4px_8px] text-left w-[20%]">Cv= {constructionStage.U_shear?.shearCoefficient?.toFixed(2) || '-'}</td>
                                                <td className="p-[4px_8px] text-left w-[25%]">h/tw= {constructionStage.U_shear?.slendernessRatio?.toFixed(1) || '-'}</td>
                                                <td className="p-[4px_8px] text-left w-[25%]">1.10 √(k<sub>v</sub>E/Fy) = {constructionStage.U_shear?.yieldLimit?.toFixed(1) || '-'}</td>
                                                <td className="p-[4px_8px] text-left w-[25%]">1.37 √(k<sub>v</sub>E/Fy) = {constructionStage.U_shear?.bucklingLimit?.toFixed(1) || '-'}</td>
                                            </tr>
                                            <tr><td className="p-[4px_8px] text-left" colSpan={5}>(3) Check</td></tr>
                                            <tr>
                                                <td className="p-[4px_8px] text-left w-[5%]"></td>
                                                <td className="p-[4px_8px] text-left w-[20%]">Vu= {constructionStage.U_shear?.requiredStrength?.toFixed(2) || '-'} kN</td>
                                                <td className="p-[4px_8px] text-left w-[20%]">ΦVn= {constructionStage.U_shear?.designStrength?.toFixed(2) || '-'} kN</td>
                                                <td className="p-[4px_8px] text-left font-bold" colSpan={2}>Vu/ΦVn= {constructionStage.U_shear?.ratio?.toFixed(2) || '-'} =&gt; {renderCheck(constructionStage.U_shear?.check)}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* 1.2 H-section */}
                            <div className={`${subsectionTitleClass} mt-5`}>1.2 H-section (KDS 14 31 10)</div>
                            <div className="border border-[#ccc] bg-white mt-2.5 text-xs">
                                <div className="p-2 border-b border-[#ccc]">
                                    <div className="font-bold mb-[5px]">1) Negative Bending (4.3.2.1.1.2 강축 휨을 받는 2축대칭 H형강 또는 ㄷ형강 조밀단면 부재)</div>
                                    <table className="border-collapse w-full mt-2">
                                        <tbody>
                                            <tr><td className="p-[4px_8px] text-left" colSpan={6}>(1) 탄성휨모멘트</td></tr>
                                            <tr>
                                                <td className="p-[4px_8px] text-left w-[5%]"></td>
                                                <td className="p-[4px_8px] text-left w-[20%]">Mn=My=FySx=</td>
                                                <td className="p-[4px_8px] text-left w-[20%]">{constructionStage.H_negative?.yieldStrength?.toFixed(1) || constructionStage.H_negative?.elasticMoment?.toFixed(1) || '-'} kN-m</td>
                                                <td className="p-[4px_8px] text-left" colSpan={3}>※ 시공시 탄성강도 검토</td>
                                            </tr>
                                            <tr><td className="p-[4px_8px] text-left" colSpan={6}>(2) 횡비틀림좌굴강도</td></tr>
                                            <tr>
                                                <td className="p-[4px_8px] text-left w-[5%]"></td>
                                                <td className="p-[4px_8px] text-left w-[20%]">Mn=</td>
                                                <td className="p-[4px_8px] text-left w-[20%]">{constructionStage.H_negative?.lateralBucklingStrength?.toFixed(1) || '-'} kN-m</td>
                                                <td className="p-[4px_8px] text-left" colSpan={3}>※H형강 Lb는 실제 길이 x2, 캔틸레버로 가정</td>
                                            </tr>
                                            <tr>
                                                <td className="p-[4px_8px] text-left w-[5%]"></td>
                                                <td className="p-[4px_8px] text-left w-[20%]">Lb= {constructionStage.H_negative?.Lb?.toFixed(2) || '-'} m</td>
                                                <td className="p-[4px_8px] text-left w-[20%]">Lp= {constructionStage.H_negative?.Lp?.toFixed(2) || '-'} m</td>
                                                <td className="p-[4px_8px] text-left w-[18.33%]">Lr= {constructionStage.H_negative?.Lr?.toFixed(2) || '-'} m</td>
                                                <td className="p-[4px_8px] text-left" colSpan={2}></td>
                                            </tr>
                                            <tr><td className="p-[4px_8px] text-left" colSpan={6}>(3) Check</td></tr>
                                            <tr>
                                                <td className="p-[4px_8px] text-left w-[5%]"></td>
                                                <td className="p-[4px_8px] text-left w-[20%]">Mu= {constructionStage.H_negative?.requiredStrength?.toFixed(2) || '-'} kN-m</td>
                                                <td className="p-[4px_8px] text-left w-[20%]">φMn= {constructionStage.H_negative?.designStrength?.toFixed(1) || '-'} kN-m</td>
                                                <td className="p-[4px_8px] text-left font-bold" colSpan={3}>Mu/φMn= {constructionStage.H_negative?.ratio?.toFixed(2) || '-'} =&gt; {renderCheck(constructionStage.H_negative?.check)}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>

                                <div className="p-2">
                                    <div className="font-bold mb-[5px]">2) Shear (4.3.2.1.2.2 웨브가 수직보강재에 의해 보강 또는 보강되지 않은 부재)</div>
                                    <table className="border-collapse w-full mt-2">
                                        <tbody>
                                            <tr><td className="p-[4px_8px] text-left" colSpan={6}>(1) 전단항복강도</td></tr>
                                            <tr>
                                                <td className="p-[4px_8px] text-left w-[5%]"></td>
                                                <td className="p-[4px_8px] text-left w-[20%]">Vn=0.6FyAw=</td>
                                                <td className="p-[4px_8px] text-left w-[20%]">{constructionStage.H_shear?.yieldStrength?.toFixed(1) || '-'} kN</td>
                                                <td className="p-[4px_8px] text-left" colSpan={3}></td>
                                            </tr>
                                            <tr><td className="p-[4px_8px] text-left" colSpan={5}>(2) 전단좌굴감소계수</td></tr>
                                            <tr>
                                                <td className="p-[4px_8px] text-left w-[5%]"></td>
                                                <td className="p-[4px_8px] text-left w-[20%]">Cv= {constructionStage.H_shear?.shearCoefficient?.toFixed(1) || '-'}</td>
                                                <td className="p-[4px_8px] text-left w-[25%]">h/tw= {constructionStage.H_shear?.slendernessRatio?.toFixed(1) || '-'}</td>
                                                <td className="p-[4px_8px] text-left w-[25%]">1.10 √(k<sub>v</sub>E/Fy) = {constructionStage.H_shear?.yieldLimit?.toFixed(1) || '-'}</td>
                                                <td className="p-[4px_8px] text-left w-[25%]">1.37 √(k<sub>v</sub>E/Fy) = {constructionStage.H_shear?.bucklingLimit?.toFixed(1) || '-'}</td>
                                            </tr>
                                            <tr><td className="p-[4px_8px] text-left" colSpan={5}>(3) Check</td></tr>
                                            <tr>
                                                <td className="p-[4px_8px] text-left w-[5%]"></td>
                                                <td className="p-[4px_8px] text-left w-[20%]">Vu= {constructionStage.H_shear?.requiredStrength?.toFixed(2) || '-'} kN</td>
                                                <td className="p-[4px_8px] text-left w-[20%]">φVn= {constructionStage.H_shear?.designStrength?.toFixed(1) || '-'} kN</td>
                                                <td className="p-[4px_8px] text-left font-bold" colSpan={2}>Vu/φVn= {constructionStage.H_shear?.ratio?.toFixed(1) || '-'} =&gt; {renderCheck(constructionStage.H_shear?.check)}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* 1.3 Deflection */}
                            <div className={`${subsectionTitleClass} mt-5`}>1.3 Deflection</div>
                            <div className="border border-[#ccc] bg-white mt-2.5 text-xs">
                                <div className="p-2">
                                    <table className="border-collapse w-full mt-2">
                                        <tbody>
                                            <tr><td className="p-[4px_8px] text-left" colSpan={6}>(1) 자중에 의한 처짐</td></tr>
                                            <tr>
                                                <td className="p-[4px_8px] text-left w-[5%]"></td>
                                                <td className="p-[4px_8px] text-left w-[20%]">Δ<sub>D1</sub> = {constructionStage.deflection?.deflectionD1?.toFixed(2) || '-'} mm</td>
                                                <td className="p-[4px_8px] text-left" colSpan={4}></td>
                                            </tr>
                                            <tr><td className="p-[4px_8px] text-left" colSpan={6}>(2) 시공하중에 의한 처짐</td></tr>
                                            <tr>
                                                <td className="p-[4px_8px] text-left w-[5%]"></td>
                                                <td className="p-[4px_8px] text-left w-[20%]">Δ<sub>C</sub> = {constructionStage.deflection?.deflectionC?.toFixed(2) || '-'} mm</td>
                                                <td className="p-[4px_8px] text-left" colSpan={4}></td>
                                            </tr>
                                            <tr><td className="p-[4px_8px] text-left" colSpan={6}>(3) Check</td></tr>
                                            <tr>
                                                <td className="p-[4px_8px] text-left w-[5%]"></td>
                                                <td className="p-[4px_8px] text-left w-[20%]">Δ<sub>total</sub>= {constructionStage.deflection?.totalDeflection?.toFixed(2) || '-'} mm</td>
                                                <td className="p-[4px_8px] text-left w-[20%]">Limit= {constructionStage.deflection?.limit?.toFixed(2) || '-'} mm</td>
                                                <td className="p-[4px_8px] text-left font-bold" colSpan={3}>
                                                    {constructionStage.deflection?.totalDeflection && constructionStage.deflection?.limit
                                                        ? <>Δ<sub>total</sub>/Limit= {(constructionStage.deflection.totalDeflection / constructionStage.deflection.limit).toFixed(2)} =&gt; {renderCheck(constructionStage.deflection?.check)}</>
                                                        : '-'}
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        {/* 2. Composite Stage */}
                        <div className={sectionDividerClass}></div>
                        <div>
                            <div className={subsectionTitleClass}>2. Composite Stage</div>
                            {/* 2.1 Composite U-section */}
                            <div className={`${subsectionTitleClass} mt-2.5`}>2.1 Composite U-section (KDS 41 30 20)</div>
                            <div className="border border-[#ccc] bg-white mt-2.5 text-xs">
                                <div className="p-2 border-b border-[#ccc]">
                                    <div className="font-bold mb-[5px]">1) Positive Bending (4.1.3.2 강재앵커(전단연결재)를 갖는 합성보)</div>
                                    <table className="border-collapse w-full mt-2">
                                        <tbody>
                                            <tr><td className="p-[4px_8px] text-left" colSpan={6}>(1) 판폭두께비</td></tr>
                                            <tr>
                                                <td className="p-[4px_8px] text-left w-[5%]"></td>
                                                <td className="p-[4px_8px] text-left w-[20%]">웨브 h/tw= {compositeStage.U_positive?.webWT?.wtRatio?.toFixed(2) || '-'}</td>
                                                <td className="p-[4px_8px] text-left w-[20%]">3.76 √(E/Fy) = {compositeStage.U_positive?.webWT?.lambda_p?.toFixed(2) || '-'}</td>
                                                <td className="p-[4px_8px] text-left font-bold" colSpan={3}>=&gt; {renderCheck(compositeStage.U_positive?.webWT?.check)}</td>
                                            </tr>
                                            <tr><td className="p-[4px_8px] text-left" colSpan={6}>(2) Check:</td></tr>
                                            <tr>
                                                <td className="p-[4px_8px] text-left w-[5%]"></td>
                                                <td className="p-[4px_8px] text-left w-[20%]">Mu= {compositeStage.U_positive?.requiredStrength?.toFixed(2) || '-'} kN-m</td>
                                                <td className="p-[4px_8px] text-left w-[20%]">φMn= {compositeStage.U_positive?.designStrength?.toFixed(1) || '-'} kN-m</td>
                                                <td className="p-[4px_8px] text-left font-bold" colSpan={3}>Mu/φMn= {compositeStage.U_positive?.ratio?.toFixed(2) || '-'} =&gt; {renderCheck(compositeStage.U_positive?.check)}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>

                                <div className="p-2 border-b border-[#ccc]">
                                    <div className="font-bold mb-[5px]">2) Negative Bending (4.1.3.2 강재앵커(전단연결재)를 갖는 합성보)</div>
                                    <table className="border-collapse w-full mt-2">
                                        <tbody>
                                            <tr><td className="p-[4px_8px] text-left" colSpan={6}>(1) 판폭두께비 =&gt; <span className="font-bold">항복모멘트</span></td></tr>
                                            <tr>
                                                <td className="p-[4px_8px] text-left w-[5%]"></td>
                                                <td className="p-[4px_8px] text-left w-[20%] font-bold">웨브:</td>
                                                <td className="p-[4px_8px] text-left w-[18.33%]">λ = {compositeStage.U_negative?.webWT?.wtRatio?.toFixed(2) || '-'}</td>
                                                <td className="p-[4px_8px] text-left w-[18.33%]">λp = {compositeStage.U_negative?.webWT?.lambda_p?.toFixed(2) || '-'}</td>
                                                <td className="p-[4px_8px] text-left w-[18.33%]">λr = {compositeStage.U_negative?.webWT?.lambda_r?.toFixed(2) || '-'}</td>
                                                <td className="p-[4px_8px] text-left font-bold">=&gt; {renderCheck(compositeStage.U_negative?.webWT?.check)}</td>
                                            </tr>
                                            <tr>
                                                <td className="p-[4px_8px] text-left w-[5%]"></td>
                                                <td className="p-[4px_8px] text-left w-[20%] font-bold">하부플랜지:</td>
                                                <td className="p-[4px_8px] text-left w-[18.33%]">λ = {compositeStage.U_negative?.bottomFlangeWT?.wtRatio?.toFixed(2) || '-'}</td>
                                                <td className="p-[4px_8px] text-left w-[18.33%]">λp = {compositeStage.U_negative?.bottomFlangeWT?.lambda_p?.toFixed(2) || '-'}</td>
                                                <td className="p-[4px_8px] text-left w-[18.33%]">λr = {compositeStage.U_negative?.bottomFlangeWT?.lambda_r?.toFixed(2) || '-'}</td>
                                                <td className="p-[4px_8px] text-left font-bold">=&gt; {renderCheck(compositeStage.U_negative?.bottomFlangeWT?.check)}</td>
                                            </tr>
                                            <tr><td className="p-[4px_8px] text-left" colSpan={6}>(2) Check:</td></tr>
                                            <tr>
                                                <td className="p-[4px_8px] text-left w-[5%]"></td>
                                                <td className="p-[4px_8px] text-left w-[20%]">Mu= {compositeStage.U_negative?.requiredStrength?.toFixed(2) || '-'} kN-m</td>
                                                <td className="p-[4px_8px] text-left w-[20%]">φMn= {compositeStage.U_negative?.designStrength?.toFixed(1) || '-'} kN-m</td>
                                                <td className="p-[4px_8px] text-left font-bold" colSpan={3}>Mu/φMn= {compositeStage.U_negative?.ratio?.toFixed(2) || '-'} =&gt; {renderCheck(compositeStage.U_negative?.check)}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>

                                <div className="p-2">
                                    <div className="font-bold mb-[5px]">3) Shear (4.1.4.1 충전형 및 매입형 합성부재)</div>
                                    <table className="border-collapse w-full mt-2">
                                        <tbody>
                                            <tr><td className="p-[4px_8px] text-left" colSpan={5}>(1) 전단항복강도:</td></tr>
                                            <tr>
                                                <td className="p-[4px_8px] text-left w-[5%]"></td>
                                                <td className="p-[4px_8px] text-left w-[20%]">Vn=0.6FyAw=</td>
                                                <td className="p-[4px_8px] text-left w-[20%]">{compositeStage.shear?.yieldStrength?.toFixed(1) || '-'} kN</td>
                                                <td className="p-[4px_8px] text-left" colSpan={2}></td>
                                            </tr>
                                            <tr><td className="p-[4px_8px] text-left" colSpan={5}>(2) 전단좌굴감소계수:</td></tr>
                                            <tr>
                                                <td className="p-[4px_8px] text-left w-[5%]"></td>
                                                <td className="p-[4px_8px] text-left w-[20%]">Cv= {compositeStage.shear?.shearCoefficient?.toFixed(2) || '-'}</td>
                                                <td className="p-[4px_8px] text-left w-[25%]">h/tw= {compositeStage.shear?.slendernessRatio?.toFixed(1) || '-'}</td>
                                                <td className="p-[4px_8px] text-left w-[25%]">1.10 √(k<sub>v</sub>E/Fy) = {compositeStage.shear?.yieldLimit?.toFixed(1) || '-'}</td>
                                                <td className="p-[4px_8px] text-left w-[25%]">1.37 √(k<sub>v</sub>E/Fy) = {compositeStage.shear?.bucklingLimit?.toFixed(1) || '-'}</td>
                                            </tr>
                                            <tr><td className="p-[4px_8px] text-left" colSpan={5}>(3) Check:</td></tr>
                                            <tr>
                                                <td className="p-[4px_8px] text-left w-[5%]"></td>
                                                <td className="p-[4px_8px] text-left w-[20%]">Vu= {compositeStage.shear?.requiredStrength?.toFixed(2) || '-'} kN</td>
                                                <td className="p-[4px_8px] text-left w-[20%]">φVn= {compositeStage.shear?.designStrength?.toFixed(2) || '-'} kN</td>
                                                <td className="p-[4px_8px] text-left font-bold" colSpan={2}>Vu/φVn= {compositeStage.shear?.ratio?.toFixed(2) || '-'} =&gt; {renderCheck(compositeStage.shear?.check)}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* 2.2 Composite H-section */}
                            <div className={`${subsectionTitleClass} mt-5`}>2.2 Composite H-section (KDS 41 30 20)</div>
                            <div className="border border-[#ccc] mt-2.5 text-xs">
                                <div className="p-2">
                                    <div className="font-bold mb-[5px]">1) Negative Bending (4.1.3.2 강재앵커(전단연결재)를 갖는 합성보)</div>
                                    <table className="border-collapse w-full mt-2">
                                        <tbody>
                                            <tr><td className="p-[4px_8px] text-left" colSpan={6}>(1) 판폭두께비 =&gt; 소성모멘트:</td></tr>
                                            <tr>
                                                <td className="p-[4px_8px] text-left w-[5%]"></td>
                                                <td className="p-[4px_8px] text-left w-[15%]">웨브:</td>
                                                <td className="p-[4px_8px] text-left w-[15%]">λ = {compositeStage.H_negative?.webWT?.wtRatio?.toFixed(2) || '-'}</td>
                                                <td className="p-[4px_8px] text-left w-[15%]">λp = {compositeStage.H_negative?.webWT?.lambda_p?.toFixed(2) || '-'}</td>
                                                <td className="p-[4px_8px] text-left w-[15%]">λr = {compositeStage.H_negative?.webWT?.lambda_r?.toFixed(2) || '-'}</td>
                                                <td className="p-[4px_8px] text-left font-bold">=&gt; {renderCheck(compositeStage.H_negative?.webWT?.check)}</td>
                                            </tr>
                                            <tr>
                                                <td className="p-[4px_8px] text-left w-[5%]"></td>
                                                <td className="p-[4px_8px] text-left w-[15%]">하부플랜지:</td>
                                                <td className="p-[4px_8px] text-left w-[15%]">λ = {compositeStage.H_negative?.bottomFlangeWT?.wtRatio?.toFixed(2) || '-'}</td>
                                                <td className="p-[4px_8px] text-left w-[15%]">λp = {compositeStage.H_negative?.bottomFlangeWT?.lambda_p?.toFixed(2) || '-'}</td>
                                                <td className="p-[4px_8px] text-left w-[15%]">λr = {compositeStage.H_negative?.bottomFlangeWT?.lambda_r?.toFixed(2) || '-'}</td>
                                                <td className="p-[4px_8px] text-left font-bold">=&gt; {renderCheck(compositeStage.H_negative?.bottomFlangeWT?.check)}</td>
                                            </tr>
                                            <tr><td className="p-[4px_8px] text-left" colSpan={6}>(2) Check:</td></tr>
                                            <tr>
                                                <td className="p-[4px_8px] text-left w-[5%]"></td>
                                                <td className="p-[4px_8px] text-left w-[20%]">Mu= {compositeStage.H_negative?.requiredStrength?.toFixed(2) || '-'} kN-m</td>
                                                <td className="p-[4px_8px] text-left w-[20%]">φMn= {compositeStage.H_negative?.designStrength?.toFixed(1) || '-'} kN-m</td>
                                                <td className="p-[4px_8px] text-left font-bold" colSpan={3}>Mu/φMn= {compositeStage.H_negative?.ratio?.toFixed(2) || '-'} =&gt; {renderCheck(compositeStage.H_negative?.check)}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* 2.3 Deflection */}
                            <div className={`${subsectionTitleClass} mt-5`}>2.3 Deflection (강구조설계(한국강구조학회) 9.3.8 합성보의 처짐)</div>
                            <div className="border border-[#ccc] mt-2.5 text-xs">
                                <div className="p-2">
                                    <table className="border-collapse w-full mt-2">
                                        <tbody>
                                            <tr>
                                                <td className="p-[4px_8px] text-left w-[15%]">(1) 합성률=</td>
                                                <td className="p-[4px_8px] text-left w-[21.25%]">{compositeStage.deflection?.compositeRatio?.toFixed(1) || '-'} %</td>
                                                <td className="p-[4px_8px] text-left w-[21.25%]"></td>
                                                <td className="p-[4px_8px] text-left w-[21.25%]"></td>
                                                <td className="p-[4px_8px] text-left w-[21.25%]"></td>
                                            </tr>
                                            <tr>
                                                <td className="p-[4px_8px] text-left w-[15%]">(2) ΔL =</td>
                                                <td className="p-[4px_8px] text-left w-[21.25%]">{compositeStage.deflection?.deflectionLive?.toFixed(1) || '-'} mm</td>
                                                <td className="p-[4px_8px] text-left w-[21.25%]">L/360= {compositeStage.deflection?.deflectionLiveLimit?.toFixed(1) || '-'}</td>
                                                <td className="p-[4px_8px] text-left font-bold w-[21.25%]">
                                                    Ratio= {compositeStage.deflection?.deflectionLive && compositeStage.deflection?.deflectionLiveLimit
                                                        ? (compositeStage.deflection.deflectionLive / compositeStage.deflection.deflectionLiveLimit).toFixed(1)
                                                        : '-'} =&gt; {renderCheck(compositeStage.deflection?.deflectionLiveCheck)}
                                                </td>
                                                <td className="p-[4px_8px] text-left w-[21.25%]"></td>
                                            </tr>
                                            <tr>
                                                <td className="p-[4px_8px] text-left w-[15%]">(3) ΔL+D =</td>
                                                <td className="p-[4px_8px] text-left w-[21.25%]">{compositeStage.deflection?.deflectionDeadLive?.toFixed(1) || '-'} mm</td>
                                                <td className="p-[4px_8px] text-left w-[21.25%]">L/240= {compositeStage.deflection?.deflectionDeadLiveLimit?.toFixed(1) || '-'}</td>
                                                <td className="p-[4px_8px] text-left font-bold w-[21.25%]">
                                                    Ratio= {compositeStage.deflection?.deflectionDeadLive && compositeStage.deflection?.deflectionDeadLiveLimit
                                                        ? (compositeStage.deflection.deflectionDeadLive / compositeStage.deflection.deflectionDeadLiveLimit).toFixed(2)
                                                        : '-'} =&gt; {renderCheck(compositeStage.deflection?.deflectionDeadLiveCheck)}
                                                </td>
                                                <td className="p-[4px_8px] text-left w-[21.25%]"></td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* 2.4 Vibration */}
                            <div className={`${subsectionTitleClass} mt-5`}>2.4 Vibration (강구조 설계(한국강구조학회) 7.8.2 진동)</div>
                            <div className="border border-[#ccc] mt-2.5 text-xs">
                                <div className="p-2">
                                    <table className="border-collapse w-full mt-2">
                                        <tbody>
                                            <tr>
                                                <td className="p-[4px_8px] text-left w-[20%]">(1) 고유진동수 fn=</td>
                                                <td className="p-[4px_8px] text-left w-[20%]">{compositeStage.vibration?.naturalFrequency?.toFixed(1) || '-'} Hz</td>
                                                <td className="p-[4px_8px] text-left w-[20%]">3 Hz</td>
                                                <td className="p-[4px_8px] text-left font-bold w-[20%]">
                                                    =&gt; {renderCheck(compositeStage.vibration?.naturalFrequency && compositeStage.vibration.naturalFrequency >= 3 ? 'OK' : 'NG')}
                                                </td>
                                                <td className="p-[4px_8px] text-left w-[20%]"></td>
                                            </tr>
                                            <tr>
                                                <td className="p-[4px_8px] text-left w-[20%]">(2) 최대가속도비=</td>
                                                <td className="p-[4px_8px] text-left w-[20%]">{compositeStage.vibration?.maxAccelerationRatio?.toFixed(2) || '-'} %</td>
                                                <td className="p-[4px_8px] text-left w-[20%]">가속도한계비= {compositeStage.vibration?.accelerationLimit?.toFixed(1) || '-'} %</td>
                                                <td className="p-[4px_8px] text-left font-bold w-[20%]">
                                                    =&gt; {renderCheck(compositeStage.vibration?.maxAccelerationRatio && compositeStage.vibration?.accelerationLimit
                                                        && compositeStage.vibration.maxAccelerationRatio <= compositeStage.vibration.accelerationLimit ? 'OK' : 'NG')}
                                                </td>
                                                <td className="p-[4px_8px] text-left w-[20%]"></td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                <div className="flex justify-end p-2.5 border-t border-[#eee]">
                    <button
                        className="action-button"
                        onClick={(e) => {
                            (e.currentTarget as HTMLButtonElement).blur();
                            setOpen(false);
                        }}
                        autoFocus
                    >
                        Close
                    </button>
                </div>
            </div>
        </Dialog>
    );
};

export default DetailDialog;
