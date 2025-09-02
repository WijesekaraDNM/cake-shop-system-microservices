import { React, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { useSearchParams, useNavigate } from 'react-router-dom';
import classes from './registerPage.module.css';
import Title from '../../Components/Title/Title';
import Input from '../../Components/Input/Input';
import Button from '../../Components/Button/Button.js';
import { FaEye } from 'react-icons/fa';
import { BsEyeSlash } from 'react-icons/bs';
import { useAuth } from '../../hooks/useAuth';
import { Icons } from 'react-toastify';

export default function RegisterPage() {
  const auth = useAuth();
  const { user } = auth;
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const returnUrl = params.get('returnUrl');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const toggleShowPassword = () => setShowPassword(prev => !prev);
  const toggleShowConfirmPassword = () => setShowConfirmPassword(prev => !prev);

  useEffect (() => {
    if (!user) return;
    returnUrl ? navigate(returnUrl) : navigate('/');

  },[user]);

  const {
    handleSubmit,
    register,
    getValues,
    formState: { errors },
  } = useForm();

  const submit = async data => {
    await auth.register(data);
  };

  return (
    <div className={classes.bg}>
      <div className={classes.Container}>
          <div className={classes.details}>
            <Title title="Register" margin={" 2rem 0 3rem 6rem"} fontSize={"4rem"} color={"crimson"}/>
            <form onSubmit={handleSubmit(submit)} noValidate>
              <Input
                type="text"
                label= "Name"
                {...register('name', {
                  required: true,
                  minLength: 5,
      
                })}
                error = {errors.name}
                />
              <Input
                type="email"
                label= "Email"
                {...register('email', {
                  required: true,
                  pattern: {
                    value: /^[\w-.]+@([\w-]+\.)+[\w-]{2,63}$/i,
                    message: 'Email is not valid.',
                  },
                })}
                error = {errors.email}
              />
             <div className={classes.passwordWrapper}>
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    label="Password"
                    {...register('password', {
                      required: true,
                      minLength: 5,
                    })}
                    className = {classes.password}
                    error={errors.password}
                  />
                  <button
                    type="button"
                    onClick={toggleShowPassword}
                    className={classes.iconButton}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <BsEyeSlash /> : <FaEye />}
                  </button>
                </div>

                <div className={classes.passwordWrapper}>
                  <Input
                    type={showConfirmPassword ? 'text' : 'password'}
                    label="Confirm Password"
                    {...register('confirmPassword', {
                      required: true,
                      validate: value => (value === getValues('password') ? true : 'Password does not match'),
                    })}
                    className={classes.password}
                    error={errors.confirmPassword}
                  />
                  <button
                    type="button"
                    onClick={toggleShowConfirmPassword}
                    className={classes.iconButton}
                    aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                  >
                    {showConfirmPassword ? <BsEyeSlash /> : <FaEye />}
                  </button>
                </div>

              <Input
                type="text"
                label= "Address"
                {...register('address', {
                  required: true,
                  minLength: 10,
                })}
                error = {errors.address}
              />
              <Button type="submit" text = "Register" color={"white"} backgroundColor={"crimson"} height={"1.8rem"} width={"18rem"} fontSize={"1rem"} margin={"2rem 0 1rem 2rem"} />
            <div className={classes.login}>
              Already a user? &nbsp;
              <Link to={`/login?${returnUrl ? 'returnUrl='+ returnUrl : ''}`}>
                Login here
              </Link>
            </div>
                
          </form>
        </div>
    </div>
    
  </div>


  /*
   <div className= { classes.container }>
    <div className={classes.details}>
      <Title title="Login"/>
      <form onSubmit={handleSubmit(submit)} noValidate>
        <Input
          type="email"
          label= "Email"
          {...register('email', {
            required: true,
            pattern: {
              value: /^[\w-.]+@([\w-]+\.)+[\w-]{2,63}$/i,
              message: 'Email Is Not Valid',
            },
          })}
          error = {errors.email}
          />
           <Input
            type="password"
            label= "Password"
            {...register('password', {
              required: true,
            }
            )}
            error = {errors.password}
          />
          <Button type="submit" text = "Login" />
      </form>
    </div>
  </div>*/
  );
  
}

