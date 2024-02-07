import styled from "styled-components"

export const SignupContainerStyled = styled.div`
max-width: 30%;
margin: auto;
.icon-google {
  background: url(https://accounts.scdn.co/sso/images/new-google-icon.72fd940a229bc94cf9484a3320b3dccb.svg) center center no-repeat;
  width: 1.5rem;
  height: 1.5rem;
  margin-left: 10px;
}

.icon-facebook {
  background: url("https://accounts.scdn.co/sso/images/new-facebook-icon.eae8e1b6256f7ccf01cf81913254e70b.svg") center center no-repeat;
  width: 1.5rem;
  height: 1.5rem;
  margin-left: 10px;
}
.login-google {
  background-color: white !important;
  border-color: #dadce0 !important;
  width: 100%;
  &:hover {
    color: black !important;
  }
}

.login-facebook {
  background-color: #4185f4 !important;
  border-color: transparent !important;
  width: 100%;
  &:hover {
    color: black !important;
  }
}

.border-radio {
  border: 1px #d9d9d9 solid;
  padding: 8px 16px;
  border-radius: 4px;
}
.ant-steps {
  width: 600px !important;
  margin: auto !important;
}
.ant-steps-icon-dot {
  display: none;
}
.ant-steps-item {
  flex: 1;
  margin: 0 !important;
  padding: 0 !important;
}
.ant-steps-item-last {
  flex: none;
}
.ant-steps .ant-steps-item-finish>.ant-steps-item-container>.ant-steps-item-tail::after {
  background-color: transparent !important;
} 
.ant-steps.ant-steps-dot .ant-steps-item-tail::after, .ant-steps.ant-steps-dot.ant-steps-small .ant-steps-item-tail::after {
  width: 100% !important;
}
`