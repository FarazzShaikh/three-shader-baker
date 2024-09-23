import { TwitterLogoIcon } from "@radix-ui/react-icons";

export function Copy() {
  return (
    <div className="copy">
      <br />
      Made with 👽 by{" "}
      <a target="_blank" href="https://github.com/FarazzShaikh">
        Faraz Shaikh
      </a>
      <div
        className="social"
        onClick={() => {
          window.open("https://twitter.com/CantBeFaraz", "__blank");
        }}
      >
        <TwitterLogoIcon width={20} height={20} />
      </div>
    </div>
  );
}
