import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import classes from "./loginPage.module.css";
import Title from "../../Components/Title/Title";
import Input from "../../Components/Input/Input";
import Button from "../../Components/Button/Button.js";

export default function LoginPage() {
  const { handleSubmit, register, formState: { errors }, setError, clearErrors } = useForm();
  const navigate = useNavigate();
  const { user, login } = useAuth();
  const [params] = useSearchParams();
  const returnUrl = params.get("returnUrl");
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState("");

  useEffect(
    () => {
      if (!user) return;
      returnUrl ? navigate(returnUrl) : navigate("/");
    },
    [user, navigate, returnUrl]
  );

  const submit = async ({ email, password }) => {
    clearErrors();
    setLoginError("");
    setLoading(true);

    try {
      await login(email, password);
      // Redirection handled on user change by useEffect
    } catch (err) {
      setLoading(false);
      console.log("error: ", err)
    } finally {
      setLoading(false);
    }
  };

 
  return (
    <div className={classes.mainContainer}>
      <div className={classes.Container}>
        <div className={classes.leftSide}>
          <div className={classes.content}>
            <h4>Have an amazing experience with your dreamed cake.</h4>
          </div>
          <img
            className={classes.image}
            src={"/foods/CakeLogo.png"}
            alt={"Cake Logo"}
          />
        </div>
        <div className={classes.rightSide}>
          <div className={classes.details}>
            <Title
              display={"flex"}
              title="Login"
              margin={"5%"}
              fontSize={"2rem"}
              justifyContent={"center"}
              alignItems={"center"}
            />
            {loginError && <p className={classes.errorMessage}>{loginError}</p>}

            <form onSubmit={handleSubmit(submit)} noValidate>
              <Input
                className = {classes.inputContainer}
                type="email"
                label="Email"
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[\w-.]+@([\w-]+\.)+[\w-]{2,63}$/i,
                    message: "Email is not valid"
                  }
                })}
              />
              {errors.email && <p className={classes.errorMessage}>{errors.email.message}</p>}

              <Input
                className = {classes.inputContainer}
                type="password"
                label="Password"
                {...register("password", {
                  required: "Password is required",
                })}
              />
              {errors.password && <p className={classes.errorMessage}>{errors.password.message}</p>}

              <Button
                type="submit"
                text={loading ? "Logging in..." : "Login"}
                color={"white"}
                backgroundColor={"crimson"}
                height={"1.8rem"}
                width={"18rem"}
                fontSize={"1rem"}
                margin={"2rem 0 1rem 2rem"}
                padding={"2rem"}
                disabled={loading}
              />

              <div className={classes.register}>
                New user? &nbsp;
                <Link to={`/Register?${returnUrl ? "returnUrl=" + returnUrl : ""}`}>
                  Create Account here
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
