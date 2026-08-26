import { render, screen } from '@testing-library/react';
import HomePage from './page';

describe('HomePage', () => {
  it('renders the Commerce Platform heading', () => {
    render(<HomePage />);
    expect(screen.getByText('Commerce Platform')).toBeDefined();
  });

  it('renders navigation links', () => {
    render(<HomePage />);
    expect(screen.getByText('Products')).toBeDefined();
    expect(screen.getByText('Customers')).toBeDefined();
    expect(screen.getByText('Orders')).toBeDefined();
  });
});
