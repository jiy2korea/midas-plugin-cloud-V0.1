import React, { useState } from 'react';
import { SearchInputs } from '../types';

interface SearchFormProps {
    onSearch: (inputs: SearchInputs) => void;
}

// H형강 리스트 (match_list.tsv 기반)
const H_SECTION_LIST = [
    'H-248X124X5X8', 'H-250X125X6X9', 'H-244X175X7X11',
    'H-298X149X5.5X8', 'H-300X150X6.5X9', 'H-294X200X8X12', 'H-298X201X9X14',
    'H-346X174X6X9', 'H-350X175X7X11', 'H-354X176X8X13',
    'H-336X249X8X12', 'H-340X250X9X14',
    'H-396X199X7X11', 'H-400X200X8X13', 'H-404X201X9X15',
    'H-386X299X9X14', 'H-390X300X10X16',
    'H-446X199X8X12', 'H-450X200X9X14',
    'H-434X299X10X15', 'H-440X300X11X18',
    'H-496X199X9X14', 'H-500X200X10X16', 'H-506X201X11X19',
    'H-482X300X11X15', 'H-488X300X11X18',
    'H-596X199X10X15', 'H-600X200X11X17', 'H-606X201X12X20', 'H-612X202X13X23',
    'H-582X300X12X17', 'H-588X300X12X20', 'H-594X302X14X23',
    'H-692X300X13X20', 'H-700X300X13X24', 'H-708X302X15X28',
    'H-792X300X14X22', 'H-800X300X14X26', 'H-808X302X16X30',
    'H-890X299X15X23', 'H-900X300X16X28', 'H-912X302X18X34', 'H-918X303X19X37',
    'H-244X252X11X11', 'H-248X249X8X13', 'H-250X250X9X14', 'H-250X255X14X14',
    'H-294X302X12X12', 'H-298X299X9X14', 'H-304X301X11X17', 'H-310X305X15X20', 'H-310X310X20X20',
    'H-338X351X13X13', 'H-344X348X10X16', 'H-344X354X16X16', 'H-350X350X12X19', 'H-350X357X19X19',
    'H-388X402X15X15', 'H-394X398X11X18', 'H-394X405X18X18', 'H-400X400X13X21', 'H-400X408X21X21',
    'H-406X403X16X24', 'H-414X405X18X28', 'H-428X407X20X35',
    'H-458X417X30X50', 'H-498X432X45X70',
];

const SearchForm: React.FC<SearchFormProps> = ({ onSearch }) => {
    // 선택된 부재 이름 (기본값: H-600X200X11X17)
    const [selectedMember, setSelectedMember] = useState('H-600X200X11X17');

    // Additional Informations 상태
    const [inputs, setInputs] = useState({
        rebarTopCount: '0',
        rebarTopDia: 'D25',
        rebarBotCount: '0',
        rebarBotDia: 'D25',
        fYr: '600',
        studSpacing: '200',
        angleSpacing: '200',
        fYU: 'SM355',
        fYH: 'SM355',
        concrete: 'C30',
        slabDs: '150',
        slabBeff: '10000',
        support: '미사용',
    });

    const handleInputChange = (field: string, value: string) => {
        setInputs((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleSearchClick = () => {
        onSearch({
            selectedMember,
            ...inputs
        });
    };

    return (
        <>
            {/* Selected Member */}
            <fieldset className="section-fieldset">
                <legend>Selected Member</legend>
                <select
                    className="member-select"
                    value={selectedMember}
                    onChange={(e) => setSelectedMember(e.target.value)}
                >
                    {H_SECTION_LIST.map((section) => (
                        <option key={section} value={section}>{section}</option>
                    ))}
                </select>
            </fieldset>

            {/* Additional Informations */}
            <fieldset className="section-fieldset">
                <legend>Additional Informations</legend>
                <div className="additional-info-container">
                    {/* 왼쪽 영역 - 테이블 레이아웃 */}
                    <div className="info-left">
                        <table className="info-table-left">
                            <tbody>
                                <tr>
                                    <td className="label-cell-left-title">- Re-bar</td>
                                    <td className="label-cell-left-sub">top</td>
                                    <td className="input-cell-left">
                                        <input
                                            type="text"
                                            value={inputs.rebarTopCount}
                                            onChange={(e) => handleInputChange('rebarTopCount', e.target.value)}
                                            placeholder="개수"
                                            className="input-small"
                                        />
                                        <span className="separator">-</span>
                                        <select value={inputs.rebarTopDia} onChange={(e) => handleInputChange('rebarTopDia', e.target.value)}>
                                            <option value="">지름</option>
                                            <option value="D10">D10</option>
                                            <option value="D13">D13</option>
                                            <option value="D16">D16</option>
                                            <option value="D19">D19</option>
                                            <option value="D22">D22</option>
                                            <option value="D25">D25</option>
                                            <option value="D29">D29</option>
                                            <option value="D32">D32</option>
                                        </select>
                                    </td>
                                    <td className="unit-cell-left"></td>
                                </tr>
                                <tr>
                                    <td className="label-cell-left-title"></td>
                                    <td className="label-cell-left-sub">bot.</td>
                                    <td className="input-cell-left">
                                        <input
                                            type="text"
                                            value={inputs.rebarBotCount}
                                            onChange={(e) => handleInputChange('rebarBotCount', e.target.value)}
                                            placeholder="개수"
                                            className="input-small"
                                        />
                                        <span className="separator">-</span>
                                        <select value={inputs.rebarBotDia} onChange={(e) => handleInputChange('rebarBotDia', e.target.value)}>
                                            <option value="">지름</option>
                                            <option value="D10">D10</option>
                                            <option value="D13">D13</option>
                                            <option value="D16">D16</option>
                                            <option value="D19">D19</option>
                                            <option value="D22">D22</option>
                                            <option value="D25">D25</option>
                                            <option value="D29">D29</option>
                                            <option value="D32">D32</option>
                                        </select>
                                    </td>
                                    <td className="unit-cell-left"></td>
                                </tr>
                                <tr>
                                    <td className="label-cell-left-title"></td>
                                    <td className="label-cell-left-sub">f<sub>yr</sub></td>
                                    <td className="input-cell-left">
                                        <select value={inputs.fYr} onChange={(e) => handleInputChange('fYr', e.target.value)}>
                                            <option value=""></option>
                                            <option value="300">300</option>
                                            <option value="400">400</option>
                                            <option value="500">500</option>
                                            <option value="600">600</option>
                                        </select>
                                    </td>
                                    <td className="unit-cell-left">MPa</td>
                                </tr>
                                <tr>
                                    <td className="label-cell-left-title">- Shear Connector</td>
                                    <td className="label-cell-left-sub">stud</td>
                                    <td className="input-cell-left">
                                        <input
                                            type="text"
                                            value={inputs.studSpacing}
                                            onChange={(e) => handleInputChange('studSpacing', e.target.value)}
                                            placeholder="간격"
                                        />
                                    </td>
                                    <td className="unit-cell-left">mm</td>
                                </tr>
                                <tr>
                                    <td className="label-cell-left-title"></td>
                                    <td className="label-cell-left-sub">angle</td>
                                    <td className="input-cell-left">
                                        <input
                                            type="text"
                                            value={inputs.angleSpacing}
                                            onChange={(e) => handleInputChange('angleSpacing', e.target.value)}
                                            placeholder="간격"
                                        />
                                    </td>
                                    <td className="unit-cell-left">mm</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* 오른쪽 영역 - 그리드 레이아웃 */}
                    <div className="info-right">
                        <table className="info-table">
                            <tbody>
                                <tr>
                                    <td className="label-cell-wide" colSpan={2}>- F<sub>yU</sub></td>
                                    <td className="input-cell">
                                        <select value={inputs.fYU} onChange={(e) => handleInputChange('fYU', e.target.value)}>
                                            <option value=""></option>
                                            <option value="SM355">SM355</option>
                                            <option value="SM420">SM420</option>
                                            <option value="SM460">SM460</option>
                                            <option value="SN355">SN355</option>
                                            <option value="SHN355">SHN355</option>
                                        </select>
                                    </td>
                                    <td className="label-cell-inline">F<sub>yH</sub></td>
                                    <td className="input-cell">
                                        <select value={inputs.fYH} onChange={(e) => handleInputChange('fYH', e.target.value)}>
                                            <option value=""></option>
                                            <option value="SM355">SM355</option>
                                            <option value="SM420">SM420</option>
                                            <option value="SM460">SM460</option>
                                            <option value="SN355">SN355</option>
                                            <option value="SHN355">SHN355</option>
                                        </select>
                                    </td>
                                </tr>
                                <tr>
                                    <td className="label-cell-wide" colSpan={2}>- Concrete</td>
                                    <td className="input-cell">
                                        <select value={inputs.concrete} onChange={(e) => handleInputChange('concrete', e.target.value)}>
                                            <option value=""></option>
                                            <option value="C24">C24</option>
                                            <option value="C30">C30</option>
                                            <option value="C40">C40</option>
                                        </select>
                                    </td>
                                    <td className="label-cell-inline"></td>
                                    <td className="unit-cell"></td>
                                </tr>
                                <tr>
                                    <td className="label-cell-right">- Slab</td>
                                    <td className="label-cell-sub-left">d<sub>s</sub></td>
                                    <td className="input-cell">
                                        <input type="text" value={inputs.slabDs} onChange={(e) => handleInputChange('slabDs', e.target.value)} />
                                    </td>
                                    <td className="unit-cell-inline">mm</td>
                                    <td className="unit-cell"></td>
                                </tr>
                                <tr>
                                    <td className="label-cell-right"></td>
                                    <td className="label-cell-sub-left">b<sub>eff</sub></td>
                                    <td className="input-cell">
                                        <input type="text" value={inputs.slabBeff} onChange={(e) => handleInputChange('slabBeff', e.target.value)} />
                                    </td>
                                    <td className="unit-cell-inline">mm</td>
                                    <td className="unit-cell"></td>
                                </tr>
                                <tr>
                                    <td className="label-cell-wide" colSpan={2}>- Support</td>
                                    <td className="input-cell">
                                        <select value={inputs.support} onChange={(e) => handleInputChange('support', e.target.value)}>
                                            <option value="미사용">미사용</option>
                                            <option value="사용">사용</option>
                                        </select>
                                    </td>
                                    <td className="label-cell-inline"></td>
                                    <td className="unit-cell"></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </fieldset>

            {/* Search Button - 필드 바깥쪽 */}
            <div className="search-button-container">
                <button className="search-button" onClick={handleSearchClick}>
                    Search Satisfied Section
                </button>
            </div>
        </>
    );
};

export default SearchForm;
