import React from 'react';
import { render, screen } from '@testing-library/react';
import Graphin from './Graphin';
import { Utils } from '.';

describe('Graphin', () => {
  test('renders <Graphin> component into the DOM', () => {
    const graphData = Utils.mock(5).circle().graphin();
    render(<Graphin data={graphData} />);

    const canvasWrapperElement = screen.getByTestId('custom-element');
    const graphinContainerElement = screen.getByTestId('graphin-container');
    const canvasElement = document.querySelector('[data-testid="graphin-container"] canvas');

    expect(canvasWrapperElement).toBeInTheDocument();
    expect(graphinContainerElement).toBeInTheDocument();
    expect(canvasElement).toBeInTheDocument();
  });
});
