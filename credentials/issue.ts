import { Router, Request } from "express";
import { SUPPORTED_SIGNING_ALGORITHM, v4 } from "@govtechsg/open-attestation";

const router = Router();

interface IssueReqBody {
  credential: {
    "@context": string[];
    id: string;
    type: string[];
    issuer: {
      id: string;
    };
    issuanceDate: string;
    expirationDate: string;
    credentialSubject: any;
  };
  options?: {
    created: string;
    challenge: string;
    domain: string;
    credentialStatus: {
      type: string;
    };
  };
}

/**
 * API: https://w3c-ccg.github.io/vc-api/#issue-credential
 */
router.post("/", async (req: Request<{}, {}, IssueReqBody>, res) => {
  try {
    // console.log("Request", req.body.credential);

    const wrappedDoocument = await v4.wrapDocument(req.body.credential as any);

    // console.log("wrappedDoocument", wrappedDoocument);

    const signedWrappedDocument = await v4.signDocument(
      wrappedDoocument,
      SUPPORTED_SIGNING_ALGORITHM.Secp256k1VerificationKey2018,
      // Issuer: example.openattestation.com
      {
        public: "did:ethr:0xB26B4941941C51a4885E5B7D3A1B861E54405f90#controller",
        private: "0xCD27DC84C82C5814E7EDAC518EDD5F263E7DB7F25ADB7A1AFE13996A95583CF2",
      }
    );

    res.json(signedWrappedDocument).status(201).end();
  } catch (e) {
    if (e instanceof Error) {
      console.error(e.message, "\n");
      res.send(e.message);
    }
    res.status(400).end();
  }
});

export default router;
