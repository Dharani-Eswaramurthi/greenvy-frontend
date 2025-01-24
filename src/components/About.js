import React, { useState, useEffect } from 'react';
import { Box, Heading, Text, Input, Button, VStack, HStack } from '@chakra-ui/react';
import { CgArrowRight } from 'react-icons/cg';
import {Toaster, toaster} from "../components/ui/toaster";
import emailjs from 'emailjs-com';
import leaf1 from "../assets/leaf1.png";
import leaf2 from "../assets/leaf2.png";
import leaf3 from "../assets/leaf3.png";
import leaf4 from "../assets/leaf4.png";
import '../styles/About.css';

const About = () => {
  const calculateTimeLeft = () => {
    const difference = +new Date('2024-01-01') - +new Date();
    let timeLeft = {};

    if (difference > 0) {
      timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    }

    return timeLeft;
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearTimeout(timer);
  });

  const UseToast = (title, type) => {
    toaster.create({
      title: title,
      type: type,
    });
  };

  const timerComponents = [];

  Object.keys(timeLeft).forEach((interval) => {
    if (!timeLeft[interval]) {
      return;
    }

    timerComponents.push(
      <span key={interval}>
        {timeLeft[interval]} {interval}{" "}
      </span>
    );
  });

  const handleSubscribe = () => {
    if (!validateEmail(email)) {
      UseToast('Please enter a valid email address.', 'error');
      return;
    }

    setLoading(true);

    const templateParams = {
      type: 'Subscriber',
      template: `Subscriber email: ${email}`
    };

    emailjs.send(
      process.env.REACT_APP_EMAILJS_SERVICE_ID,
      process.env.REACT_APP_EMAILJS_TEMPLATE_ID,
      templateParams,
      process.env.REACT_APP_EMAILJS_USER_ID
    ).then((response) => {
      UseToast("Thanks! We'll keep updating you.", 'success');
      setEmail('');
      setLoading(false);
    }, (error) => {
      UseToast('Something went wrong. Please try again later.', 'error');
      setLoading(false);
    });
  };

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };

  return (
    <div style={{ padding: '3rem' }}>
    <Box className="home" display="flex" justifyContent="space-between" p={4}>
      <Box className="text-content" textAlign="left">
        <Heading as="h2" size="xl" mb={4} className="title">Welcome to Greenvy: A Step Towards a Greener Future</Heading>
        <Text mb={4} className="paragraph">
          Join us in our mission to create a greener future. Subscribe to our newsletter for updates and exclusive offers on eco-friendly and sustainable products.
        </Text>
        <HStack mb={4} className="subscribe">
          <Box position="relative" width="100%">
            <Input
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="subscribe-input"
            />
            <Button
              className="subscribe-button"
              onClick={handleSubscribe}
              isLoading={loading}
              rightIcon={<CgArrowRight />}
              position="absolute"
              top="0"
              right="0"
              height="100%"
              borderRadius="0 25px 25px 0"
            >
              Subscribe
            </Button>
          </Box>
        </HStack>
        <Text mb={4} className="paragraph">
          At Greenvy, we are more than just an e-commerce platform—we’re a movement dedicated to building a sustainable future. As we prepare for our launch, we invite you to join us on this incredible journey towards creating a healthier planet and a brighter tomorrow.
        </Text>
        <Heading as="h2" size="lg" mb={4} className="title">Our mission is simple yet profound:</Heading>
        <Text mb={4} className="paragraph">
          To provide eco-friendly, biodegradable, and sustainable products that minimize harm to the environment while empowering communities to make conscious choices.
        </Text>
        <img src={leaf1} alt="Leaf 1" className="leaf-image mobile-only" />
        <Heading as="h2" size="lg" mb={4} className="title">Why Choose Greenvy?</Heading>
        <Text mb={4} className="paragraph">
          🌱 <strong>Eco-Conscious at Heart</strong><br />
          Every product in our store is meticulously vetted to ensure it meets the highest standards of sustainability. From biodegradable packaging to ethically sourced materials, we aim to reduce environmental footprints, one purchase at a time.
        </Text>
        <Text mb={4} className="paragraph">
          🌿 <strong>Products with a Purpose</strong><br />
          Our offerings are more than just goods—they’re solutions designed to combat waste, preserve resources, and contribute to the well-being of our planet. When you choose Greenvy, you’re investing in a cleaner, greener Earth.
        </Text>
        <img src={leaf2} alt="Leaf 2" className="leaf-image mobile-only" />
        <Text mb={4} className="paragraph">
          🌍 <strong>Community-Driven Vision</strong><br />
          We believe real change happens when communities come together. That’s why Greenvy partners with local artisans, eco-innovators, and green initiatives to bring you unique, impactful products while supporting small businesses worldwide.
        </Text>
        <Heading as="h2" size="lg" mb={4} className="title">Our Commitment to You and the Earth</Heading>
        <Text mb={4} className="paragraph">
          At the core of Greenvy lies a promise to:
        </Text>
        <Text mb={4} className="paragraph">
          <ul>
            <li>Deliver Sustainability: By offering biodegradable and recyclable products that support a circular economy.</li>
            <li>Promote Awareness: Through education and actionable steps that inspire eco-conscious living.</li>
            <li>Drive Change: With every order, we pledge to reinvest in green projects that heal the planet, from reforestation to renewable energy programs.</li>
          </ul>
        </Text>
        <img src={leaf3} alt="Leaf 3" className="leaf-image mobile-only" />
        <Heading as="h2" size="lg" mb={4} className="title">Stay Tuned—Something Amazing is Coming!</Heading>
        <Text mb={4} className="paragraph">
          This is just the beginning of a lifelong commitment to serve humanity and preserve the Earth. We’re working hard to create an unparalleled shopping experience that aligns with our green values and yours.
        </Text>
        <Text mb={4} className="paragraph">
          ✨ <strong>Be Part of the Movement:</strong> Subscribe to our newsletter for sneak peeks, exclusive updates, and early access to our launch. Together, let’s make every choice a step towards a better world.
        </Text>
        <img src={leaf4} alt="Leaf 4" className="leaf-image mobile-only" />
        <Heading as="h2" size="lg" mb={4} className="title">Greenvy: Thoughtful Products for a Thoughtful Planet.</Heading>
        <Text mb={4} className="paragraph">
          The future is green. Will you join us?
        </Text>
        <Box className="countdown" fontSize="1.5rem">
          {timerComponents.length ? timerComponents : <span style={{ fontSize: '1.5rem' }}>Time's up!</span>}
        </Box>
      </Box>
      <Box className="leaf-images desktop-only">
        <img src={leaf1} alt="Leaf 1" className="leaf-image" />
        <img src={leaf2} alt="Leaf 2" className="leaf-image" />
        <img src={leaf3} alt="Leaf 3" className="leaf-image" />
        <img src={leaf4} alt="Leaf 4" className="leaf-image" />
      </Box>
      <Box className="leaf-animation"></Box>
    </Box>
    </div>
  );
};

export default About;
