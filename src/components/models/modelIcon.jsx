import { cn } from "@/lib/utils";
import mistral from "@/public/providers/mistral.png";
import groq from "@/public/providers/groq.png";
import perplexity from "@/public/providers/perplexity.png";
import { IconSparkles } from "@tabler/icons-react";
import { useTheme } from "next-themes";
import PropTypes from "prop-types";
import { AnthropicSVG } from "../../../icons/anthropic-svg";
import { GoogleSVG } from "../../../icons/google-svg";
import { OpenAISVG } from "../../../icons/openai-svg";

export const ModelIcon = ({ provider, height, width, ...props }) => {
  const { theme } = useTheme();

  switch (provider) {
    case "openai":
      return (
        <OpenAISVG
          className={cn(
            "rounded-sm bg-white p-1 text-black",
            props.className,
            theme === "dark" ? "bg-white" : "border-DEFAULT border-black"
          )}
          width={width}
          height={height}
        />
      );
    case "mistral":
      return (
        <Image
          className={cn(
            "rounded-sm p-1",
            theme === "dark" ? "bg-white" : "border-DEFAULT border-black"
          )}
          src={mistral.src}
          alt="Mistral"
          width={width}
          height={height}
        />
      );
    case "groq":
      return (
        <Image
          className={cn(
            "rounded-sm p-0",
            theme === "dark" ? "bg-white" : "border-DEFAULT border-black"
          )}
          src={groq.src}
          alt="Groq"
          width={width}
          height={height}
        />
      );
    case "anthropic":
      return (
        <AnthropicSVG
          className={cn(
            "rounded-sm bg-white p-1 text-black",
            props.className,
            theme === "dark" ? "bg-white" : "border-DEFAULT border-black"
          )}
          width={width}
          height={height}
        />
      );
    case "google":
      return (
        <GoogleSVG
          className={cn(
            "rounded-sm bg-white p-1 text-black",
            props.className,
            theme === "dark" ? "bg-white" : "border-DEFAULT border-black"
          )}
          width={width}
          height={height}
        />
      );
    case "perplexity":
      return (
        <Image
          className={cn(
            "rounded-sm p-1",
            theme === "dark" ? "bg-white" : "border-DEFAULT border-black"
          )}
          src={perplexity.src}
          alt="Perplexity"
          width={width}
          height={height}
        />
      );
    default:
      return <IconSparkles size={width} />;
  }
};

ModelIcon.propTypes = {
  provider: PropTypes.oneOf([
    "openai",
    "mistral",
    "groq",
    "anthropic",
    "google",
    "perplexity",
  ]).isRequired,
  height: PropTypes.number.isRequired,
  width: PropTypes.number.isRequired,
  className: PropTypes.string,
};

export default ModelIcon;
