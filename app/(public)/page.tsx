import { Metadata } from 'next';
import Slider from '@/components/Slider';

export const metadata: Metadata = {
  title: 'Home - QuietShelter Empowerment Foundation',
  description: 'Welcome to QuietShelter Empowerment Foundation. Learn how we provide shelter, food security, and empowerment.',
  openGraph: {
    title: 'Home - QuietShelter Empowerment Foundation',
    description: 'Welcome to QuietShelter Empowerment Foundation. Learn how we provide shelter, food security, and empowerment.',
    url: 'https://quietshelter.org',
    images: ['/images/deso.jpg'],
  },
};

export default function Home() {
  return (
    <div>
      <Slider />
    </div>
  );
}