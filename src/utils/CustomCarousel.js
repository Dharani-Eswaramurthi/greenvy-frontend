import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import { FaArrowRight, FaArrowLeft } from 'react-icons/fa6';
import '../styles/CustomCarousel.css';

const CustomCarousel = ({ images }) => {
    const navigate = useNavigate();

    const handleImageClick = (index) => {
        if (index === 0) {
            navigate('/become-seller');
        }
    };

    const pagination = {
        clickable: true,
        renderBullet: function (index, className) {
            return '<span class="' + className + '"></span>';
        },
    };

    return (
        <Swiper
            modules={[Navigation, Pagination, Autoplay]}
            spaceBetween={10}
            slidesPerView={1}
            autoplay={{
                delay: 3000,
                disableOnInteraction: false,
            }}
            navigation={{
                nextEl: '.swiper-button-next',
                prevEl: '.swiper-button-prev',
            }}
            pagination={pagination}
            loop={true}
            centeredSlides={true}
            className="custom-carousel"
            breakpoints={{
                640: {
                    slidesPerView: 1,
                    spaceBetween: 20,
                },
                768: {
                    slidesPerView: 1,
                    spaceBetween: 30,
                },
                1024: {
                    slidesPerView: 1,
                    spaceBetween: 40,
                },
            }}
        >
            {images.map((image, index) => (
                <SwiperSlide key={index}>
                    <img
                        src={image}
                        alt={`carousel-${index}`}
                        className="carousel-image"
                        onClick={() => handleImageClick(index)}
                    />
                </SwiperSlide>
            ))}

                <FaArrowRight size={30} className="swiper-button-next"/>
                <FaArrowLeft size={30} className="swiper-button-prev"/>
        </Swiper>
    );
};

export default CustomCarousel;
