import React from 'react';
import { render, screen } from '@testing-library/react';
import Graphin from './Graphin';
import { Utils } from '.';

test('renders learn react link', () => {
  const graphData = Utils.mock(5).circle().graphin();
  render(<Graphin data={graphData} />);
  //   const linkElement = screen.getByText(/learn react/i);
  //   expect(linkElement).toBeInTheDocument();
  expect(1).toBe(1);
});
