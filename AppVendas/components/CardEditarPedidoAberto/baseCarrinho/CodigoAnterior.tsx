// Como estava antes
// return (
//   <ScrollView>
//     <ContainerCardEmpresa>
//       {visibleEmpresas.map((empresa, empresaIndex) => {
//         const totalEmpresa = empresa.produtos.reduce(
//           (total, produto, produtoIndex) => {
//             const quantidade = quantidades[empresaIndex][produtoIndex];
//             return total + produto.valorProduto * quantidade;
//           },
//           0
//         );

//         const produtosExibir =
//           route.name === "PedidoEmAberto"
//             ? empresa.produtos.slice(0, 4)
//             : empresa.produtos;

//         return (
//           <Fragment key={empresa.id}>
//             <ContentCardEmpresa>
//               <HeaderCardEmpresa>
//                 <ContainerNomeEmpresa>
//                   <TextEmpresa fontSize={16} weight={700}>
//                     {empresa.nome}
//                   </TextEmpresa>
//                   <TextEmpresa fontSize={14} weight={400}>
//                     {empresa.endereco}
//                   </TextEmpresa>
//                 </ContainerNomeEmpresa>
//                 {route.name !== "DetalhePedidoAberto" &&
//                   route.name !== "DetalhePedidoSicronizado" && (
//                     <IconesCardCarrinho />
//                   )}
//               </HeaderCardEmpresa>
//               <ContainerPedido>
//                 {produtosExibir.map((produto, produtoIndex) => (
//                   <ItemPedido key={produto.codigo}>
//                     <ImagemProduto source={produto.imagem} />
//                     <DetalhesPedido>
//                       <ContainerTextItemPedido>
//                         <TextEmpresa fontSize={14} weight={600}>
//                           {produto.codigo}
//                         </TextEmpresa>
//                         <TextEmpresa fontSize={14} weight={400}>
//                           {produto.nome}
//                         </TextEmpresa>
//                       </ContainerTextItemPedido>
//                       <ContainerTextItemPedido>
//                         <ContainerQuantidade>
//                           <ButtonCardEmpresa
//                             onPress={() =>
//                               handleDecrement(empresaIndex, produtoIndex)
//                             }
//                           >
//                             <Ionicons name="remove" size={38} color="black" />
//                           </ButtonCardEmpresa>
//                           <InputQuantidade
//                             value={String(
//                               quantidades[empresaIndex]?.[produtoIndex] || 1
//                             )}
//                             editable={true}
//                             onChangeText={(text) => {
//                               const newQuantity = parseInt(text, 10);
//                               if (!isNaN(newQuantity) && newQuantity > 0) {
//                                 setQuantidades((prevQuantidades) =>
//                                   prevQuantidades.map(
//                                     (empresaQuantidades, i) =>
//                                       i === empresaIndex
//                                         ? empresaQuantidades.map((qtd, j) =>
//                                             j === produtoIndex
//                                               ? newQuantity
//                                               : qtd
//                                           )
//                                         : empresaQuantidades
//                                   )
//                                 );
//                               }
//                             }}
//                             maxLength={8}
//                             keyboardType="number-pad"
//                             style={{
//                               width: 100, // Define uma largura fixa para o campo
//                               textAlign: "center", // Centraliza o texto no input
//                             }}
//                           />

//                           <ButtonCardEmpresa
//                             onPress={() =>
//                               handleIncrement(empresaIndex, produtoIndex)
//                             }
//                           >
//                             <Feather name="plus" size={38} color="black" />
//                           </ButtonCardEmpresa>
//                           <Text style={{ fontSize: 18 }}>
//                             {(
//                               produto.valorProduto *
//                               (quantidades[empresaIndex]?.[produtoIndex] || 1)
//                             ).toLocaleString("pt-BR", {
//                               style: "currency",
//                               currency: "BRL",
//                             })}
//                           </Text>
//                         </ContainerQuantidade>
//                       </ContainerTextItemPedido>
//                     </DetalhesPedido>
//                     <FontAwesome
//                       name="trash"
//                       size={28}
//                       color="#ff4f45"
//                       style={{ marginRight: 10 }}
//                       onPress={() =>
//                         handleRemoveProduct(empresaIndex, produtoIndex)
//                       }
//                     />
//                   </ItemPedido>
//                 ))}
//               </ContainerPedido>
//             </ContentCardEmpresa>
//             <ContainerFooterCard>
//               <TextEmpresa fontSize={17} weight={600}>
//                 Subtotal:{" "}
//                 {totalEmpresa.toLocaleString("pt-BR", {
//                   style: "currency",
//                   currency: "BRL",
//                 })}
//               </TextEmpresa>
//               <TextEmpresa fontSize={17} weight={600}>
//                 Total:{" "}
//                 {totalEmpresa.toLocaleString("pt-BR", {
//                   style: "currency",
//                   currency: "BRL",
//                 })}
//               </TextEmpresa>
//             </ContainerFooterCard>
//             <ButtonsCarrinhoCheck />
//           </Fragment>
//         );
//       })}
//     </ContainerCardEmpresa>
//   </ScrollView>
// );
// };