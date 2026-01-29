import React, { useState, useEffect } from 'react';
import { Dialog } from '@midasit-dev/moaui';
import { DesignInputs } from '../types';

interface DesignDialogProps {
    open: boolean;
    setOpen: (open: boolean) => void;
    initialData: DesignInputs;
    onDone: (data: DesignInputs) => void;
}

const DesignDialog: React.FC<DesignDialogProps> = ({ open, setOpen, initialData, onDone }) => {
    const [inputs, setInputs] = useState<DesignInputs>(initialData);

    useEffect(() => {
        if (open) {
            setInputs(initialData);
        }
    }, [open, initialData]);

    const handleChange = (field: keyof DesignInputs, value: string) => {
        setInputs(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleDone = (e: React.MouseEvent) => {
        (e.currentTarget as HTMLButtonElement).blur();
        onDone(inputs);
        setOpen(false);
    };

    const tableClass = "w-full border-collapse text-xs mb-2.5 table-fixed";
    const thClass = "p-1.5 text-left bg-[#e8e8e8] font-normal";
    const tdClass = "p-1.5";
    const inputClass = "w-full h-7 border border-[#ccc] px-1 focus:outline-none focus:border-[#0078d4]";

    return (
        <Dialog
            open={open}
            setOpen={setOpen}
            headerTitle="Design Section"
        >
            <div className="w-[450px] p-2.5">
                <div className="mb-4">
                    <div className="font-bold text-sm mb-2">H-Section Dimensions</div>
                    <table className={tableClass}>
                        <tbody>
                            <tr>
                                <td className={`${tdClass} bg-[#f5f5f5]`} style={{ width: '150px' }}>Height (mm)</td>
                                <td className={tdClass} style={{ width: '100px' }}>
                                    <input
                                        type="text"
                                        className={inputClass}
                                        value={inputs.h_height || ''}
                                        onChange={(e) => handleChange('h_height', e.target.value)}
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td className={`${tdClass} bg-[#f5f5f5]`} style={{ width: '150px' }}>Width (mm)</td>
                                <td className={tdClass} style={{ width: '100px' }}>
                                    <input
                                        type="text"
                                        className={inputClass}
                                        value={inputs.h_width || ''}
                                        onChange={(e) => handleChange('h_width', e.target.value)}
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td className={`${tdClass} bg-[#f5f5f5]`} style={{ width: '150px' }}>Web Thickness (mm)</td>
                                <td className={tdClass} style={{ width: '100px' }}>
                                    <input
                                        type="text"
                                        className={inputClass}
                                        value={inputs.h_t1 || ''}
                                        onChange={(e) => handleChange('h_t1', e.target.value)}
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td className={`${tdClass} bg-[#f5f5f5]`} style={{ width: '150px' }}>Flange Thickness (mm)</td>
                                <td className={tdClass} style={{ width: '100px' }}>
                                    <input
                                        type="text"
                                        className={inputClass}
                                        value={inputs.h_t2 || ''}
                                        onChange={(e) => handleChange('h_t2', e.target.value)}
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td className={`${tdClass} bg-[#f5f5f5]`} style={{ width: '150px' }}>Bracket Length (mm)</td>
                                <td className={tdClass} style={{ width: '100px' }}>
                                    <input
                                        type="text"
                                        className={inputClass}
                                        value={inputs.h_bracket_length || ''}
                                        onChange={(e) => handleChange('h_bracket_length', e.target.value)}
                                    />
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div className="mb-6">
                    <div className="font-bold text-sm mb-2">U-Section Dimensions</div>
                    <table className={tableClass}>
                        <tbody>
                            <tr>
                                <td className={`${tdClass} bg-[#f5f5f5]`} style={{ width: '150px' }}>Height (mm)</td>
                                <td className={tdClass} style={{ width: '100px' }}>
                                    <input
                                        type="text"
                                        className={inputClass}
                                        value={inputs.u_height || ''}
                                        onChange={(e) => handleChange('u_height', e.target.value)}
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td className={`${tdClass} bg-[#f5f5f5]`} style={{ width: '150px' }}>Width (mm)</td>
                                <td className={tdClass} style={{ width: '100px' }}>
                                    <input
                                        type="text"
                                        className={inputClass}
                                        value={inputs.u_width || ''}
                                        onChange={(e) => handleChange('u_width', e.target.value)}
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td className={`${tdClass} bg-[#f5f5f5]`} style={{ width: '150px' }}>Thickness (mm)</td>
                                <td className={tdClass} style={{ width: '100px' }}>
                                    <input
                                        type="text"
                                        className={inputClass}
                                        value={inputs.u_thickness || ''}
                                        onChange={(e) => handleChange('u_thickness', e.target.value)}
                                    />
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div className="bottom-buttons">
                    <button className="action-button" onClick={handleDone} autoFocus>
                        Done
                    </button>
                    <button className="action-button" onClick={(e) => {
                        (e.currentTarget as HTMLButtonElement).blur();
                        setOpen(false);
                    }}>
                        Cancel
                    </button>
                </div>
            </div>
        </Dialog>
    );
};

export default DesignDialog;
