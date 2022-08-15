import { OverflowMenuVertical16 } from "@carbon/icons-react";
import { Button, Form, TextInput } from "carbon-components-react";
import React from "react";
import { useTranslation } from "react-i18next";
import styles from "./history-and-comments.scss";

const HistoryAndComments: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className={styles.commentsContainer}>
      <Form>
        <TextInput
          id="test2"
          invalidText="Invalid error message."
          placeholder="Add note"
          labelText={""}
        />
        <Button kind="primary" tabIndex={0} type="submit">
          {t("post", "Post")}
        </Button>
        <Button kind="ghost" renderIcon={OverflowMenuVertical16}>
          {t("addItem", "Add item")}
        </Button>
      </Form>
    </div>
  );
};

export default HistoryAndComments;
