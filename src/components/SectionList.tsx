import React from 'react';
import { SectionData } from '../types';


interface SectionListProps {
    sections: SectionData[];
    onSelect: (index: number) => void;
}

const SectionList: React.FC<SectionListProps> = ({ sections, onSelect }) => {
    return (
        <fieldset className="section-fieldset">
            <legend>Section List</legend>
            <div className="table-container">
                <table className="section-table">
                    <thead>
                        <tr>
                            <th rowSpan={3}>Section</th>
                            <th rowSpan={3}>Area<br />(mm²)</th>
                            <th rowSpan={3}>CHK</th>
                            <th rowSpan={3}>SEL</th>
                            <th colSpan={3}>Before Composite</th>
                            <th colSpan={3}>After Composite</th>
                        </tr>
                        <tr>
                            <th colSpan={2}>M</th>
                            <th rowSpan={2}>V</th>
                            <th colSpan={2}>M</th>
                            <th rowSpan={2}>Δ</th>
                        </tr>
                        <tr>
                            <th>end</th>
                            <th>mid</th>
                            <th>end</th>
                            <th>mid</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sections.length === 0 ? (
                            <tr>
                                <td colSpan={10} className="empty-row">
                                    Search 버튼을 눌러 섹션을 검색하세요.
                                </td>
                            </tr>
                        ) : (
                            sections.map((section, index) => (
                                <tr key={index} className={section.selected ? 'selected-row' : ''}>
                                    <td className="section-cell">
                                        {section.section.split('\n').map((line, i) => (
                                            <div key={i}>{line}</div>
                                        ))}
                                    </td>
                                    <td className="area-cell text-right">
                                        <div>{section.hArea?.toFixed(0) || '-'}</div>
                                        <div>{section.uArea?.toFixed(0) || '-'}</div>
                                    </td>
                                    <td className={section.chk === 'NG' ? 'text-ng' : ''}>{section.chk}</td>
                                    <td>
                                        <input
                                            type="checkbox"
                                            checked={section.selected}
                                            onChange={() => onSelect(index)}
                                        />
                                    </td>
                                    <td>{section.beforeComposite.mEnd.toFixed(2)}</td>
                                    <td>{section.beforeComposite.mMid.toFixed(2)}</td>
                                    <td>{section.beforeComposite.v.toFixed(2)}</td>
                                    <td>{section.afterComposite.mEnd.toFixed(2)}</td>
                                    <td>{section.afterComposite.mMid.toFixed(2)}</td>
                                    <td>{section.afterComposite.v.toFixed(2)}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </fieldset>
    );
};

export default SectionList;
