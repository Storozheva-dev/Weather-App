import css from "./Loader.module.css";
const Loader = () => (
  <div className="loader flex justify-center items-center mt-10 space-x-2">
    {[...Array(3)].map((_, i) => (
      <span
        key={i}
        className="drop w-4 h-8 bg-blue-400 rounded-full animate-drop"
        style={{ animationDelay: `${i * 0.3}s` }}
      ></span>
    ))}
  </div>
);

export default Loader;
