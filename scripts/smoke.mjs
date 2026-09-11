import { describeCnpj } from "../src/core/cnpj.js";
import { BrasilApiCnpjProvider } from "../src/providers/brasilapi.js";
import { CompanyProfileService } from "../src/services/company-profile.js";

console.log("Numeric:", describeCnpj("00.000.000/0001-91"));
console.log("Alphanumeric:", describeCnpj("00.000.000/E08G-12"));

const service = new CompanyProfileService({ providers: [new BrasilApiCnpjProvider()] });
try {
  console.log(await service.getByCnpj("00.000.000/0001-91"));
} catch (error) {
  console.error(error);
  process.exitCode = 1;
}
