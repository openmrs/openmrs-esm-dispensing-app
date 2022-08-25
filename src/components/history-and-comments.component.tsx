import React from "react";
import { Button, Form, TextInput } from "@carbon/react";
import { OverflowMenuVertical } from "@carbon/react/icons";
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
        <Button
          kind="ghost"
          renderIcon={(props) => <OverflowMenuVertical size={16} />}
        >
          {t("addItem", "Add item")}
        </Button>
      </Form>
    </div>
  );
};

export default HistoryAndComments;
