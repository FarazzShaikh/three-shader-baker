import styled from "styled-components";

export const TextureViewerContainer = styled.div`
  /* position: absolute;
  top: 0;
  right: 0;
  z-index: 100000; */

  height: 100%;
  overflow-y: scroll;
  overflow-x: hidden;
  pointer-events: all;
  padding: 10px;

  background-color: black;

  display: flex;
  flex-direction: column;
  gap: 10px;

  h1,
  h2,
  label {
    font-family: monospace;
    color: white;
    margin: 0;
  }

  form {
    display: flex;
    flex-direction: column;
    gap: 10px;
    justify-content: space-between;
    align-items: baseline;
  }

  input,
  button {
    width: 100%;
  }
`;

export const CanvasContainer = styled.div`
  position: relative;
  pointer-events: none;
  background-color: white;
  border-radius: 20px;
  overflow: hidden;

  canvas {
    width: 300px;
    height: 300px;
    border: 5px solid white;
  }

  & > span {
    position: absolute;
    bottom: 0;
    right: 0;

    padding: 8px;
    box-sizing: border-box;
    width: 100%;

    display: flex;
    justify-content: space-between;
  }

  label {
    background-color: black;
    color: white;
  }

  input {
  }
`;

export const NameContainer = styled.div`
  color: black;
  font-size: 3rem;

  button {
    font-size: 1rem;
    pointer-events: all;
    cursor: pointer;
  }

  padding: 8px;
  box-sizing: border-box;

  display: flex;
  flex-direction: column;
`;

export const LabelContainer = styled.div`
  background-color: black;
  color: white;

  position: absolute;
  top: 50%;
  left: 0;
  transform: translateY(-50%);

  padding: 8px;
  box-sizing: border-box;

  font-size: 12px;
`;

export const ChannelSelector = styled.div`
  position: absolute;
  top: 0;
  right: 0;

  padding: 8px;
  box-sizing: border-box;

  display: flex;

  button {
    flex: 1;
    background-color: gray;
  }

  button:active {
    background-color: white;
  }

  button[data-selected="true"] {
    background-color: white;
  }

  button[data-selected="false"] {
    background-color: gray;
  }
`;
