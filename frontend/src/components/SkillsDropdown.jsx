import * as React from "react";
import FormControl from "@mui/material/FormControl";
import Snackbar from "@mui/material/Snackbar";
import { PulseLoader } from "react-spinners"

import {
  useAddSkillToUserMutation,
  useGetSkillsQuery,
  useRemoveSkillFromUserMutation,
} from "../features/skills/skillsApiSlice";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import Checkbox from "@mui/material/Checkbox";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CheckBoxIcon from "@mui/icons-material/CheckBox";

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

export default function SkillsDropdown({ user }) {
  const [selectedSkills, setSelectedSkills] = React.useState(user.skills);
  const [message, setMessage] = React.useState("");
  const [snackbarOpen, setSnackbarOpen] = React.useState(false);

  const {
    data: skills,
    isSuccess: isGetSuccess,
  } = useGetSkillsQuery();

  const [
    addSkill,
    {
      isSuccess: isAddSuccess,
      isLoading: isAddLoading,
      isError: isAddError,
      error: addError,
    },
  ] = useAddSkillToUserMutation();
  
  const [
    removeSkill,
    { isError: isRemError, isSuccess: isRemSuccess, isLoading: isRemLoading, error: remError },
  ] = useRemoveSkillFromUserMutation();

  let skillIds = [];
  if (isGetSuccess) {
    skillIds = skills.ids;
  }

  const handleSubmitSkills = (e) => {
    e.preventDefault();
    const newSkillset = new Set(selectedSkills);
    const oldSkillset = new Set(user.skills);
    for (let skillId of newSkillset.difference(oldSkillset)) {
      addSkill({ skillId: skillId });
    }
    for (let skillId of oldSkillset.difference(newSkillset)) {
      removeSkill({ skillId: skillId });
    }
  };

  React.useEffect(() => {
    if (isAddSuccess) {
      setSnackbarOpen(true);
      setMessage("Successfully added skill.");
    }
  }, [isAddSuccess]);

  React.useEffect(() => {
    if (isRemSuccess) {
      setSnackbarOpen(true);
      setMessage("Successfully removed skill.");
    }
  }, [isRemSuccess]);

  React.useEffect(() => {
    if (isAddError) {
      setSnackbarOpen(true);
      setMessage(addError);
    }
  }, [isAddError, isRemError]);

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
    setMessage("");
  };

  return (
    <div>
      <FormControl variant="filled" sx={{ m: 1, minWidth: 120 }}>
        <Autocomplete
          multiple
          id="tags-standard"
          options={skillIds}
          disableCloseOnSelect
          getOptionLabel={(skillId) =>
            skills ? skills.entities[skillId].name : skillId
          }
          value={selectedSkills}
          onChange={(event, newValue) => setSelectedSkills(newValue)}
          renderOption={(props, option, { selected }) => {
            const { key, ...optionProps } = props;
            return (
              <li key={key} {...optionProps}>
                <Checkbox
                  icon={icon}
                  checkedIcon={checkedIcon}
                  style={{ marginRight: 8 }}
                  checked={selected}
                />
                {skills ? skills.entities[option].name : option}
              </li>
            );
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              variant="standard"
              label="Skills"
              sx={{ backgroundColor: "lightGrey", width: "400px" , borderRadius: "5px"}}
            />
          )}
        />

        <button className="button--primary" type="submit" onClick={handleSubmitSkills}>
          {isAddLoading || isRemLoading ? <PulseLoader/> : `Confirm Skills Changes`}
        </button>
      </FormControl>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={2000}
        onClose={handleCloseSnackbar}
        message={message}
      />
    </div>
  );
}
