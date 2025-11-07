import React, { useContext, useEffect } from "react";
import Menu from "@/components/Menu";
import { Theme } from "@/components/Theme/style";
import Top from "@/components/Top";
import MenuPrincipal from "@/components/MenuPrincipal";
import { useNavigation } from "expo-router";
import { TopProvider } from "@/context/TopContext";
import { ScrollView } from "react-native";
import AuthContext from "@/context/AuthContext";
import { LabelComponent } from "@/components/LabelComponent";
import { HistoricoComprasCacheService } from "@/services/HistoricoComprasCacheService";

const Home: React.FC = () => {
  const navigation = useNavigation();

  const { userData, setUserData } = useContext(AuthContext);
  const representanteId = userData?.representanteId;

  useEffect(() => {
    if (representanteId) {
      setUserData({ ...userData, representanteCreateId: representanteId });
    }
  }, []);

  useEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  useEffect(()=>{
    HistoricoComprasCacheService.ensureTempTable();   
  })

  return (
    <Theme>
      <TopProvider>
        <Top showHomeIcon />
      </TopProvider>
       <LabelComponent labelText="" labelTextPrefix={false}/>
      <ScrollView>
        {/* <Menu showMenu={false} /> */}

        <MenuPrincipal />
      </ScrollView>
    </Theme>
  );
};

export default Home;
