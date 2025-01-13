import sellerImage1 from '../assets/become-seller/seller1.jpeg';
import sellerImage2 from '../assets/become-seller/seller2.jpeg';
import sellerImage3 from '../assets/become-seller/seller3.jpeg';
import sellerImage4 from '../assets/become-seller/seller4.jpeg';
import bannerImage1 from '../assets/message-banner/mb1.jpeg';
import bannerImage2 from '../assets/message-banner/mb2.jpeg';
import movementImage1 from '../assets/movement/movement1.jpeg';
import movementImage2 from '../assets/movement/movement2.jpeg';
import movementImage3 from '../assets/movement/movement3.jpeg';
import movementImage4 from '../assets/movement/movement4.jpeg';
import movementImage5 from '../assets/movement/movement5.jpeg';
import themedImage1 from '../assets/themed-messages/tm1.png';
import themedImage2 from '../assets/themed-messages/tm2.png';
import themedImage3 from '../assets/themed-messages/tm3.png';

const becomeSellerImages = [sellerImage1, sellerImage2, sellerImage3, sellerImage4];
const messageBannerImages = [bannerImage1, bannerImage2];
const movementImages = [movementImage1, movementImage2, movementImage3, movementImage4, movementImage5];
const themedMessagesImages = [themedImage1, themedImage2, themedImage3];

const getRandomImage = (images) => {
    const randomIndex = Math.floor(Math.random() * images.length);
    return images[randomIndex];
};

const carouselImages = [
    getRandomImage(becomeSellerImages),
    getRandomImage(messageBannerImages),
    getRandomImage(movementImages),
    getRandomImage(themedMessagesImages),
];

export default carouselImages;
