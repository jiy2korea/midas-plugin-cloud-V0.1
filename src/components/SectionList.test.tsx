import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import SectionList from './SectionList';
import { SectionData } from '../types';

const mockSections: SectionData[] = [
    {
        section: 'H-200\nU-100',
        chk: 'OK',
        selected: false,
        beforeComposite: { mEnd: 0.5, mMid: 0.6, v: 0.3 },
        afterComposite: { mEnd: 0.7, mMid: 0.8, v: 0.4 }
    }
];

test('renders section list table', () => {
    render(<SectionList sections={mockSections} onSelect={() => { }} />);
    const linkElement = screen.getByText(/H-200/i);
    expect(linkElement).toBeInTheDocument();
});

test('handles selection', () => {
    const handleSelect = jest.fn();
    render(<SectionList sections={mockSections} onSelect={handleSelect} />);
    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);
    expect(handleSelect).toHaveBeenCalledWith(0);
});
