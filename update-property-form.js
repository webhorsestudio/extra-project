const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/components/admin/properties/PropertyForm.tsx');

// Read the current file
let content = fs.readFileSync(filePath, 'utf8');

// Add state for validation modal
const stateAddition = `  const [tempImages, setTempImages] = useState<File[]>([]);
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  const { toast } = useToast();`;

// Replace the state section
content = content.replace(
  /const \[tempImages, setTempImages\] = useState<File\[\]>\(\[\]\);\s+const \{ toast \} = useToast\(\);/,
  stateAddition
);

// Update the form submission handler
const newSubmitHandler = `  const handleFormSubmit = (data: z.infer<typeof formSchema>) => {
    if (Object.keys(form.formState.errors).length > 0) {
      // Show validation modal instead of toast
      setShowValidationModal(true);
      return;
    }
    onSubmit({ ...data, tempImages });
  };

  const handleNavigateToTab = (tab: string) => {
    setActiveTab(tab);
  };

  const handleCloseValidationModal = () => {
    setShowValidationModal(false);
  };`;

content = content.replace(
  /const handleFormSubmit = \(data: z\.infer<typeof formSchema>\) => \{[^}]*\};/s,
  newSubmitHandler
);

// Update the Tabs component to be controlled
content = content.replace(
  /<Tabs defaultValue="basic" className="w-full">/,
  '<Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">'
);

// Add the validation modal at the end before closing HydrationSuppressor
const modalAddition = `        </Form>

        {/* Validation Modal */}
        <ValidationModal
          isOpen={showValidationModal}
          onClose={handleCloseValidationModal}
          onNavigateToTab={handleNavigateToTab}
          errors={mapFormErrorsToTabErrors(form.formState.errors)}
        />
      </div>`;

content = content.replace(
  /        <\/Form>\s+      <\/div>/,
  modalAddition
);

// Write the updated content back
fs.writeFileSync(filePath, content, 'utf8');

console.log('PropertyForm updated successfully!'); 