import { TextInputProps } from "react-native";
import { Container, Icon, Input } from "./style";
interface SearchInputProps extends TextInputProps {
  value: string;
  onClear: () => void;
}

const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChangeText,
  onClear,
  ...rest
}) => {
  return (
    <Container>
      <Icon name="search" />
      <Input
        placeholder="Pesquisar..."
        placeholderTextColor="#888"
        value={value}
        onChangeText={onChangeText}
        {...rest}
      />
      {value.length > 0 && <Icon name="x-circle" active onPress={onClear} />}
    </Container>
  );
};

export default SearchInput;
