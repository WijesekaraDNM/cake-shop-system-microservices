import React, { useEffect, useState } from 'react';
import classes from './productPage.module.css';
import { useNavigate, useParams } from 'react-router-dom';
import { useCart } from '../../hooks/useCart';
import { getById } from '../../Services/foodService';
import Price from '../../Components/price/Price';
import NotFound from '../../Components/NotFound/NotFound';
import { Buffer } from 'buffer';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function ProductPage() {
  const [food, setFood] = useState({});
  const { id } = useParams();
  const { addToCart } = useCart();
  const [addingToCart, setAddingToCart] = useState(false);
  const navigate = useNavigate();

  const handleAddToCart = async () => {
    try {
      setAddingToCart(true);

      const toastId = toast.loading('Adding item to cart...');

      if (!food.name || food.price === undefined || food.price === null) {
        toast.dismiss(toastId);
        toast.error('Product data is incomplete. Please try refreshing the page.');
        setAddingToCart(false);
        return;
      }

      const productToAdd = {
        id: food._id || food.id || id,
        _id: food._id || food.id || id,
        name: food.name,
        price: Number(food.price),
        imageUrl: `data:image/jpeg;base64,${Buffer.from(food.imageData.data).toString('base64')}`,
      };

      await addToCart(productToAdd);

      toast.update(toastId, {
        render: 'Item added to cart!',
        type: toast.TYPE.SUCCESS,
        isLoading: false,
        autoClose: 3000,
      });

      navigate('/cart');
    } catch (error) {
      toast.error(`Failed to add item to cart: ${error.message}`);
    } finally {
      setAddingToCart(false);
    }
  };

  useEffect(() => {
    getById(id)
      .then(foodData => {
        setFood(foodData);
      })
      .catch(error => {
        console.error('ProductPage - Error loading food:', error);
      });
  }, [id]);

  return (
    <>
      {!food || Object.keys(food).length === 0 ? (
        <NotFound message="Food Not Found!" linkText="Back To Designs Page" />
      ) : (
        <div className={classes.container}>
          <img
            className={classes.image}
            src={`data:image/jpeg;base64,${Buffer.from(food.imageData.data).toString('base64')}`}
            alt={food.name}
          />
          <div className={classes.details}>
            <div className={classes.header}>
              <span className={classes.name}>{food.name}</span>
              <span
                className={`${classes.favorite} ${food.favorite ? ' ' : classes.not}`}
              />
              <img className={classes.heartIcon} src="/foods/heart(1).png" alt="" />
            </div>
            <div>
              <span className={classes.price}>
                <Price price={food.price} />
              </span>
            </div>
            <button onClick={handleAddToCart} disabled={addingToCart}>
              {addingToCart ? 'Adding...' : 'Add to Cart'}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
