/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Layout } from './components/Layout';
import { Hero } from './components/Hero';
import { Features } from './components/Features';
import { Pricing } from './components/Pricing';
import { Contact } from './components/Contact';

export default function App() {
  return (
    <Layout>
      <Hero />
      <Features />
      <Pricing />
      <Contact />
    </Layout>
  );
}
