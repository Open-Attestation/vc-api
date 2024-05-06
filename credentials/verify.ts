import { Router, Request, Response } from "express";
import {
  isValid,
  openAttestationVerifiers,
  verify as defaultVerify,
  verificationBuilder,
  utils,
} from "@govtechsg/oa-verify";

const router = Router();

interface VerifyReqBody {
  verifiableCredential: {
    "@context": string[];
    id: string;
    type: string[];
    issuer: {
      id: string;
    };
    issuanceDate: string;
    expirationDate: string;
    credentialSubject: any;
    proof: {
      type: string;
      cryptosuite: string;
      created: string;
      challenge: string;
      domain: string;
      nonce: string;
      verificationMethod: string;
      proofPurpose: string;
      proofValue: string;
    };
  };
  options?: {
    challenge: string;
    domain: string;
  };
}

interface VerifyResBody {
  checks: string[];
  warnings: string[];
  errors: string[];
}

/**
 * API: https://w3c-ccg.github.io/vc-api/#verify-credential
 */
router.post("/", async (req: Request<{}, {}, VerifyReqBody>, res: Response<VerifyResBody>) => {
  // console.log("Verify Request", req.body.verifiableCredential);

  const verify = getVerifier();
  const fragments = await verify(req.body.verifiableCredential as any);
  const isValidVc = isValid(fragments);

  // console.log("Verify Result", isValidVc);

  const errors: string[] = [];

  if (!isValidVc) {
    fragments
      .filter((f) => f.status === "ERROR")
      .forEach((f) => {
        errors.push(JSON.stringify(f, null, 2));
      });

    // Push at least one error in the event all verification fragments are skipped
    if (errors.length === 0) {
      errors.push("Failed OpenAttestation verification");
    }
  }

  res
    .json({ checks: fragments.map((f) => JSON.stringify(f)), warnings: [], errors })
    .status(200)
    .end();
});

export default router;

/**
 * Cached verifier (singleton)
 */
let verify: typeof defaultVerify;
function getVerifier() {
  if (!verify) {
    const provider = utils.generateProvider({
      network: "mainnet",
      providerType: "infura",
      apiKey: "bb46da3f80e040e8ab73c0a9ff365d18",
    });
    verify = verificationBuilder(openAttestationVerifiers, { provider });

    return verify;
  }

  return verify;
}
