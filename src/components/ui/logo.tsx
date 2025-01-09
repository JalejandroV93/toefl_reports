import Image from "next/image";
import logo from "@/assets/img/LogoLTSMV.png";
export const Logo = () => {
  return <Image src={logo} alt="Logo" width={100} height={100} />;
};

